import { Omit } from "../../../interfaces/omit.type";

/**
 * Params for GetOrgMembers
 */
export interface GetOrgMembersParams {
    /** if we want to do the search as an "admin" (ie: with privilege and see HIDDEN) */
    admin_mode?: 1;
    /** filter by member ranks (1 being the higest, 6 the lowest) */
    rank?: OrgMemberRank;
    /** filter by member rank () */
    role?: OrgMemberRole;
    /** filter by member main/affiliate status (1 = Main only | 0 = Affiliate only) */
    main_org?: 0 | 1;
    /** filter by member monicker/handle */
    search?: string;
    /** filter by member visibility */
    visibility?: OrgMemberVisibility;
    /** SSID of the org to search for */
    symbol: string;
}

export interface PaginatedGetOrgMembersParam extends GetOrgMembersParams {
    page: number;
    pagesize: number;
}

export type GetOrgMembersPaginatedOpts = Omit<PaginatedGetOrgMembersParam, "admin_mode" | "symbol">;
export type GetOrgMembersOpts = Omit<GetOrgMembersParams, "admin_mode" | "symbol"> & {
    /**
     * return every members in the org
     * 
     * **\/!\ due to an RSI's API limitation, this will generate ceil(OrgMembers / 32) API calls.** 
     * This is therefore a "little" slow.
     * 
     * If you only want the total **count** of members and not their infos, see GetOrgsMembers.totalrows
     */
    allMembers: boolean;
};

/**
 * Options for
 */
export type GetOrgMembersOptions = GetOrgMembersOpts | GetOrgMembersPaginatedOpts;

/**
 * Available ranks in an org for members
 */
export enum OrgMemberRank {
    FIVE_STARS = 1,
    FOUR_STARS = 2,
    THREE_STARS = 3,
    TWO_STARS = 4,
    ONE_STAR = 5,
    ZERO_STAR = 6
}

/**
 * Available visibilities in an org for members
 */
export enum OrgMemberVisibility {
    VISIBLE = "V",
    REDACTED = "R",
    HIDDEN = "H"
}

/**
 * Available roles in an org for main members
 */
export enum OrgMemberRole {
    /**can do anything, from recruiting to customization, to simply disbanding the organization*/
    Owner = 1,
    /** can send out invites to the org, and accept or deny applicants */
    Recruitment = 2,
    /** can manage the org’s members, and their roles/ranks, as well as moderating the Org’s private Chat channel. */
    Officer = 3,
    /**can change the org’s public appearance, official texts, history, manifesto and charter. */
    Marketing = 4
}
