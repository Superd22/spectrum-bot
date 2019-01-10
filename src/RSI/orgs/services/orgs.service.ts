import { Container, Service } from "typedi";
import { RSIService } from "../../services/rsi.service";
import { GetOrgMembers } from "../interfaces/api/get-org-members.interface";
import { Organisation } from "../entities/organisation.entity";

@Service()
export class OrgsService {
    protected _rsi: RSIService = Container.get(RSIService);

    /**
     * Get a given organization
     * @param ssid the ssid of the organization
     */
    public async get(ssid: string) {
        if (!(await this.ensureExists(ssid))) throw new Error(`Org ${ssid} does not exist`);
        else {
            return new Organisation(ssid);
        }
    }

    /**
     * Ensures an organization exists
     * @param ssid unique id of the organization
     */
    public async ensureExists(ssid: string): Promise<boolean> {
        const res = await this._rsi.post<GetOrgMembers>(`api/orgs/getOrgMembers`, { symbol: ssid });
        
        return Boolean(res);
    }
}
