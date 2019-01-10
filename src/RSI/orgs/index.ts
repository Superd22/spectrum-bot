import { Container } from "typedi";
export { OrgsService } from "./services/orgs.service";
import { OrgsService } from "./services/orgs.service";

const organisations = Container.get(OrgsService);

export { organisations };
