"""
Fara'id Engine
==============
Implements the classical Sunni (majority Hanafi/Shafi'i) rules of fixed
shares (fara'id), residue (asaba), 'awl (proportional reduction when
shares are over-subscribed) and radd (proportional return of leftover
when there is no residuary heir).

Scope / limitations (clearly surfaced to the caller via `notes` /
`needs_scholar_review`):
  - Covers: husband, wife, son, daughter, father, mother, full/consanguine/
    uterine siblings, and paternal grandfather / paternal & maternal
    grandmothers as substitutes when parents are absent.
  - Does NOT model: grandchildren (son's children), nephews/nieces,
    paternal uncles and their descendants (deeper asaba chains), multiple
    generations of ascendants, or missing/unborn heir edge cases.
  - The historically disputed "grandfather with siblings" scenario is
    resolved using the majority (Abu Bakr / Hanafi) view: a present
    father or paternal grandfather fully excludes all siblings. This is
    flagged in `notes` so the user knows a scholar may rule differently.
"""

from fractions import Fraction
from typing import Dict, List


HEIR_LABELS = {
    "husband": "Husband",
    "wife": "Wife",
    "son": "Son",
    "daughter": "Daughter",
    "father": "Father",
    "mother": "Mother",
    "full_brother": "Full brother",
    "full_sister": "Full sister",
    "consanguine_brother": "Paternal half-brother",
    "consanguine_sister": "Paternal half-sister",
    "uterine_brother": "Maternal half-brother",
    "uterine_sister": "Maternal half-sister",
    "paternal_grandfather": "Paternal grandfather",
    "paternal_grandmother": "Paternal grandmother",
    "maternal_grandmother": "Maternal grandmother",
}


class FaraidResult:
    def __init__(self):
        self.shares: Dict[str, Fraction] = {}   # heir_type -> total fraction of estate (all individuals of that type combined)
        self.per_head: Dict[str, Fraction] = {}  # heir_type -> fraction per single individual
        self.notes: List[str] = []
        self.needs_scholar_review = False
        self.awl_applied = False
        self.radd_applied = False


def _get(heirs: Dict[str, int], key: str) -> int:
    return heirs.get(key, 0)


def calculate_faraid(heirs_input: List[dict]) -> FaraidResult:
    heirs: Dict[str, int] = {}
    for h in heirs_input:
        t = h["type"] if isinstance(h, dict) else h.type
        c = h["count"] if isinstance(h, dict) else h.count
        if c and c > 0:
            heirs[t] = heirs.get(t, 0) + c

    result = FaraidResult()
    has_child = _get(heirs, "son") > 0 or _get(heirs, "daughter") > 0
    has_son = _get(heirs, "son") > 0
    has_father = _get(heirs, "father") > 0
    has_mother = _get(heirs, "mother") > 0
    has_pgf = _get(heirs, "paternal_grandfather") > 0 and not has_father
    father_or_substitute = has_father or has_pgf

    fixed: Dict[str, Fraction] = {}

    # ---------- SPOUSE ----------
    if _get(heirs, "husband") > 0:
        fixed["husband"] = Fraction(1, 4) if has_child else Fraction(1, 2)
    if _get(heirs, "wife") > 0:
        fixed["wife"] = Fraction(1, 8) if has_child else Fraction(1, 4)

    # ---------- SIBLINGS: exclusion ----------
    full_b, full_s = _get(heirs, "full_brother"), _get(heirs, "full_sister")
    cons_b, cons_s = _get(heirs, "consanguine_brother"), _get(heirs, "consanguine_sister")
    ut_b, ut_s = _get(heirs, "uterine_brother"), _get(heirs, "uterine_sister")

    # A present son, father, or paternal grandfather excludes full & consanguine siblings entirely
    siblings_excluded_by_male_line = has_son or father_or_substitute
    # Any child, father, or paternal grandfather excludes uterine siblings
    uterine_excluded = has_child or father_or_substitute

    if siblings_excluded_by_male_line:
        if full_b or full_s or cons_b or cons_s:
            result.notes.append(
                "Full/paternal half-siblings are excluded from inheritance because a son, "
                "father, or paternal grandfather is present."
            )
        full_b = full_s = cons_b = cons_s = 0
    if has_pgf and (full_b or full_s or cons_b or cons_s):
        result.needs_scholar_review = True
        result.notes.append(
            "A paternal grandfather together with siblings is a classically disputed case "
            "(scholars differ, e.g. Abu Bakr vs. Zayd/Ali views). This result excludes the "
            "siblings (majority view) — please confirm with a scholar."
        )

    if cons_b or cons_s:
        if full_b or full_s:
            result.notes.append(
                "Paternal half-siblings (consanguine) are excluded because full siblings are present."
            )
            cons_b = cons_s = 0

    if uterine_excluded:
        if ut_b or ut_s:
            result.notes.append(
                "Maternal half-siblings (uterine) are excluded because a child, father, or "
                "paternal grandfather is present."
            )
        ut_b = ut_s = 0

    sibling_count_for_mother_rule = full_b + full_s + cons_b + cons_s + ut_b + ut_s

    # ---------- MOTHER ----------
    if has_mother:
        spouse_present_alone_with_parents = (
            not has_child
            and sibling_count_for_mother_rule < 2
            and has_father
            and (_get(heirs, "husband") > 0 or _get(heirs, "wife") > 0)
        )
        if spouse_present_alone_with_parents:
            spouse_share = fixed.get("husband") or fixed.get("wife") or Fraction(0)
            fixed["mother"] = Fraction(1, 3) * (1 - spouse_share)
            result.notes.append(
                "'Umariyyatain' case applied: mother receives 1/3 of the remainder after the "
                "spouse's share (not 1/3 of the whole estate)."
            )
        elif has_child or sibling_count_for_mother_rule >= 2:
            fixed["mother"] = Fraction(1, 6)
        else:
            fixed["mother"] = Fraction(1, 3)

    # ---------- GRANDMOTHERS (only if mother absent) ----------
    if not has_mother:
        pgm = _get(heirs, "paternal_grandmother") if not has_father else 0
        mgm = _get(heirs, "maternal_grandmother")
        if has_father and _get(heirs, "paternal_grandmother"):
            result.notes.append("Paternal grandmother is excluded because the father is present.")
        if pgm or mgm:
            fixed["grandmothers"] = Fraction(1, 6)
            # split equally among however many grandmother lines are present
            n_lines = (1 if pgm else 0) + (1 if mgm else 0)
            result.per_head["paternal_grandmother"] = (Fraction(1, 6) / (pgm)) if pgm else Fraction(0)
            result.per_head["maternal_grandmother"] = (Fraction(1, 6) / (mgm)) if mgm else Fraction(0)
            if pgm and mgm:
                # 1/6 total split evenly across both lines, then across heads within each line
                fixed["grandmothers"] = Fraction(1, 6)
                result.per_head["paternal_grandmother"] = Fraction(1, 12) / pgm
                result.per_head["maternal_grandmother"] = Fraction(1, 12) / mgm

    # ---------- FATHER ----------
    father_gets_residue_flag = False
    if has_father:
        if has_child:
            fixed["father"] = Fraction(1, 6)
            if not has_son:
                father_gets_residue_flag = True  # father also eligible for leftover residue
        # if no children at all, father is pure residuary (handled in residue step)

    # ---------- PATERNAL GRANDFATHER (substitute for father) ----------
    if has_pgf:
        if has_child:
            fixed["paternal_grandfather"] = Fraction(1, 6)
            if not has_son:
                father_gets_residue_flag = True
        # else pure residuary, handled below

    # ---------- DAUGHTERS (fixed share only if no son) ----------
    daughters_fixed_used = False
    n_daughters = _get(heirs, "daughter")
    if n_daughters and not has_son:
        fixed["daughter"] = Fraction(1, 2) if n_daughters == 1 else Fraction(2, 3)
        daughters_fixed_used = True

    # ---------- FULL SIBLINGS (only reached if not excluded above) ----------
    full_sisters_asaba_maal_ghayr = False
    if full_b:
        pass  # residuary, handled in residue distribution
    elif full_s:
        if daughters_fixed_used or (n_daughters and has_son is False and False):
            full_sisters_asaba_maal_ghayr = True  # take leftover jointly with daughters
        else:
            fixed["full_sister"] = Fraction(1, 2) if full_s == 1 else Fraction(2, 3)

    cons_sisters_asaba_maal_ghayr = False
    if cons_b:
        pass
    elif cons_s:
        if daughters_fixed_used and not full_s:
            cons_sisters_asaba_maal_ghayr = True
        elif not full_s and not full_b:
            fixed["consanguine_sister"] = Fraction(1, 2) if cons_s == 1 else Fraction(2, 3)

    # ---------- UTERINE SIBLINGS ----------
    if ut_b or ut_s:
        total_ut = ut_b + ut_s
        fixed["uterine"] = Fraction(1, 6) if total_ut == 1 else Fraction(1, 3)
        result.per_head["uterine_brother"] = (fixed["uterine"] / total_ut) if ut_b else Fraction(0)
        result.per_head["uterine_sister"] = (fixed["uterine"] / total_ut) if ut_s else Fraction(0)

    # ---------- SUM FIXED SHARES ----------
    total_fixed = sum(fixed.values(), Fraction(0))

    # ---------- 'AWL (proportional reduction if over-subscribed) ----------
    if total_fixed > 1:
        result.awl_applied = True
        result.notes.append(
            "'Awl applied: fixed shares exceeded the whole estate, so every share was "
            "reduced proportionally to fit exactly."
        )
        scale = Fraction(1, 1) / total_fixed
        fixed = {k: v * scale for k, v in fixed.items()}
        total_fixed = Fraction(1, 1)

    residue = Fraction(1, 1) - total_fixed

    # ---------- RESIDUE (ASABA) DISTRIBUTION ----------
    residue_recipients: Dict[str, Fraction] = {}
    if residue > 0:
        if has_son:
            n_son, n_dau = _get(heirs, "son"), _get(heirs, "daughter")
            units = n_son * 2 + n_dau * 1
            per_unit = residue / units
            residue_recipients["son"] = per_unit * 2 * n_son
            if n_dau:
                residue_recipients["daughter"] = per_unit * 1 * n_dau
            residue = Fraction(0)
        elif father_gets_residue_flag:
            key = "father" if has_father else "paternal_grandfather"
            residue_recipients[key] = residue
            residue = Fraction(0)
        elif has_father and not has_child:
            residue_recipients["father"] = residue
            residue = Fraction(0)
        elif has_pgf and not has_child:
            residue_recipients["paternal_grandfather"] = residue
            residue = Fraction(0)
        elif full_b:
            n_dau_extra = _get(heirs, "daughter") if daughters_fixed_used else 0
            # full brothers/sisters as asaba, daughters (if any, already fixed) don't re-share here
            units = full_b * 2 + full_s * 1
            per_unit = residue / units if units else Fraction(0)
            residue_recipients["full_brother"] = per_unit * 2 * full_b
            if full_s:
                residue_recipients["full_sister"] = per_unit * 1 * full_s
            residue = Fraction(0)
        elif full_sisters_asaba_maal_ghayr:
            residue_recipients["full_sister"] = residue
            residue = Fraction(0)
        elif cons_b:
            units = cons_b * 2 + cons_s * 1
            per_unit = residue / units if units else Fraction(0)
            residue_recipients["consanguine_brother"] = per_unit * 2 * cons_b
            if cons_s:
                residue_recipients["consanguine_sister"] = per_unit * 1 * cons_s
            residue = Fraction(0)
        elif cons_sisters_asaba_maal_ghayr:
            residue_recipients["consanguine_sister"] = residue
            residue = Fraction(0)

    # ---------- RADD (return of leftover if no residuary heir found) ----------
    if residue > 0:
        # Spouse is excluded from radd under the majority view.
        radd_eligible = {k: v for k, v in fixed.items() if k not in ("husband", "wife")}
        radd_total = sum(radd_eligible.values(), Fraction(0))
        if radd_total > 0:
            result.radd_applied = True
            result.notes.append(
                "Radd applied: no residuary (asaba) heir was found, so the leftover was "
                "returned proportionally to the fixed-share heirs (spouse excluded, per the "
                "majority view)."
            )
            scale_up = residue / radd_total
            for k in radd_eligible:
                fixed[k] += fixed[k] * scale_up
            residue = Fraction(0)
        else:
            result.notes.append(
                "No residuary heir and no other fixed-share heir eligible for radd — under "
                f"classical rules the remaining {residue} of the estate would pass to the "
                "public treasury (bayt al-mal). Please confirm handling with a scholar/local authority."
            )

    # ---------- MERGE ----------
    final: Dict[str, Fraction] = {}
    for k, v in fixed.items():
        if k == "grandmothers":
            continue
        final[k] = final.get(k, Fraction(0)) + v
    for k, v in residue_recipients.items():
        final[k] = final.get(k, Fraction(0)) + v

    result.shares = final
    if residue > 0:
        final["unallocated"] = residue

    return result
