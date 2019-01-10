import { OrgMemberRank, OrgMemberVisibility } from "./get-org-members-params.interface";

/**
 * Raw search result when calling getorgmembers
 */
export interface GetOrgMembers {
    /** total amount of items that matched the search */
    totalrows: number;
    /** html containing the list of members in the org */
    html: string;
}

/**
 * Parsed return from GetOrgMembers call
 */
export interface OrgMember {
    id: number;
    handle: string;
    monicker: string;
    avatar: string;
    rank: OrgMemberRank;
    visibility: OrgMemberVisibility;
}
