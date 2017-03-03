/**
 * @module Spectrum
 */ /** */

/**
 * Lists the current Star Citizen global spectrum "ranks" id for ease of use
 * Currently fetched/generated on the identify first call to the API.
 * @enum 
 */
export enum defaultStarCitizenRoles {
    /** Spectrum technial admins, doesn't seem used for actual users */
    cigAdmin = 1,
    /** Gold colored CIG Staff */
    cigStaff = 2,
    /** Purple colored global moderators */
    cigModerator = 3,
    /** backers level users */
    backer = 4,
    /** users with sub access */
    subscriber = 5,
    /** users with concierge access */
    concierge = 6,
    /** users with evocati access */
    evocati = 7,
    /** users on probation (recently moderated) */
    probatedBacker = 8,
    /** subscriber on probation */
    probatedSubscriber = 9,
    /** concierge on probation (? with access to concierge still ?) */
    probatedConcierge = 10,
    /** default role for all members */
    default = 11,
    /** anonymous (= not logged in) users */
    anonymous = 12,
}