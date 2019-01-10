export type GetApplicants = Array<OrgApplicant>;

export interface OrgApplicant {
    id: number;
    handle: string;
    nick: string;
    /** application message filled by the applicant */
    message: string;
}