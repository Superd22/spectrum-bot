import { GetApplicants } from "./../interfaces/rsi/get-applicants.interface";
import { GetApplicantsParams } from "./../interfaces/rsi/get-applicants-params.interface";
import {
    GetOrgMembersOpts,
    OrgMemberRank,
    OrgMemberVisibility
} from "../interfaces/api/get-org-members-params.interface";
import { Container } from "typedi";
import { RSIService } from "../../services/rsi.service";
import { GetOrgMembers, OrgMember } from "../interfaces/api/get-org-members.interface";
import { GetOrgMembersOptions } from "../interfaces/api/get-org-members-params.interface";
import { parse, HTMLElement } from "node-html-parser";
import { OrgApplicant } from "../interfaces/rsi/get-applicants.interface";

/**
 * Represents an RSI Organisation
 */
export class Organisation {
    /** main rsi service */
    protected _rsi: RSIService = Container.get(RSIService);

    /**
     * @param SSID unique SSID of the organisation
     */
    constructor(public readonly SSID: string) {}

    /**
     * Get the list of members for this organisation that can be seen by everyone
     * this does not require any specific privilege.
     *
     * this will **NOT** return "HIDDEN" members and will return no personal info for "REDACTED" members
     *
     * @param options fetch options
     * @see `getMembers()` If you have memberlist privilege and want all the members
     */
    public async getPublicMembers(): Promise<OrgMember[]>;
    public async getPublicMembers(options: GetOrgMembersOptions): Promise<OrgMember[]>;
    public async getPublicMembers(options?: GetOrgMembersOptions): Promise<OrgMember[]> {
        const res = await this._rsi.post<GetOrgMembers>(`api/orgs/getOrgMembers`, {
            ...options,
            symbol: this.SSID
        });

        return this.buildMembersReturn(res.data, options);
    }

    /**
     * Get the list of members for this organisation.
     * You **will** need memberlist privilege for this to work.
     *
     * @param options fetch options
     * @see `getPublicMembers()` for a list of public members if you do not have privilege
     */
    public async getMembers(): Promise<OrgMember[]>;
    public async getMembers(options: GetOrgMembersOptions): Promise<OrgMember[]>;
    public async getMembers(options?: GetOrgMembersOptions): Promise<OrgMember[]> {
        const res = await this._rsi.post<GetOrgMembers>(`api/orgs/getOrgMembers`, {
            ...options,
            admin_mode: 1,
            symbol: this.SSID
        });

        return this.buildMembersReturn(res.data, options, true);
    }

    /**
     * Get the list of current applicants
     *
     * will fetch the first 500 applicants by default.
     */
    public async getApplicants(): Promise<GetApplicants>;
    public async getApplicants(options: GetApplicantsParams): Promise<GetApplicants>;
    public async getApplicants(
        options: GetApplicantsParams = { page: 1, pagesize: 500 }
    ): Promise<GetApplicants> {
        const res = await this._rsi.navigate(
            `orgs/${this.SSID}/admin/applications?page=${options.page}&pagesize=${options.pagesize}`
        );

        return this.parseApplicants(res);
    }

    /**
     * Parse the HTML returned by getApplicants() into an array of OrgApplicant
     */
    protected parseApplicants(resHTML: string): Array<OrgApplicant> {
        const root = parse(resHTML);


        return root
            .querySelectorAll("ul.applicants-listing li.clearfix")
            .map((li: HTMLElement) => {
                const applicant: OrgApplicant = {
                    id: Number(
                        (li.querySelectorAll("div.player-cell")[0] as HTMLElement).attributes[
                            "data-app-id"
                        ]
                    ),
                    // no, this is not a typo, they do display the HANDLE in a .nick
                    handle: li.querySelectorAll("span.nick")[0].text,
                    nick: li.querySelectorAll("a.name")[0].text,
                    message: li.querySelectorAll("span.message")[0].text
                };

                return applicant;
            });
    }

    protected async buildMembersReturn(
        res: GetOrgMembers,
        opts?: GetOrgMembersOptions,
        admin = false
    ) {
        const firstPassMembers = this.parseMembers(res);

        if (opts && (opts as GetOrgMembersOpts).allMembers) {
            if (firstPassMembers.length < res.totalrows) {
                /**
                 * We have to make multiple calls because rsi api
                 * does not support a pagesize != 32 ...
                 */
                for (let i = 2; i <= Math.ceil(res.totalrows / 32); i++) {
                    // We need to fetch again :(
                    const res2 = await this._rsi.post<GetOrgMembers>(`api/orgs/getOrgMembers`, {
                        ...opts,
                        page: i,
                        admin_mode: admin ? 1 : undefined,
                        symbol: this.SSID
                    });
                    firstPassMembers.push(...this.parseMembers(res2.data));
                }
            }
        }

        return firstPassMembers;
    }

    /**
     * Parse the HTML of a getOrgMembers calls into an OrgMember array
     * @param res the res of getOrgMembers call
     */
    protected parseMembers(res: GetOrgMembers) {
        const root = parse(res.html);

        const members = root.querySelectorAll("li").map(li => {
            const el = li as HTMLElement;

            const user: OrgMember = {
                id: Number(el.attributes["data-member-id"]),
                handle: el.attributes["data-member-nickname"],
                monicker: el.attributes["data-member-displayname"],
                avatar:
                    el.attributes["data-member-avatar"].length > 5
                        ? el.attributes["data-member-avatar"]
                        : null,
                rank: null,
                visibility: null
            };

            const [_, rank] = (el.querySelector("span.ranking-stars") as HTMLElement).classNames
                .join(" ")
                .match(/data([0-9])/);

            user["rank"] = OrgMemberRank[rank];

            const [_1, visibility] = (el.querySelector(
                "span.visibility"
            ) as HTMLElement).text.match(/Membership: (.*)/);

            user["visibility"] = visibility.substr(0, 1).toUpperCase() as OrgMemberVisibility;

            return user;
        });

        return members;
    }
}
