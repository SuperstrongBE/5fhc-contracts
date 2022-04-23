import { Asset, InlineAction, Name } from "proton-tsc";
import { AtomicAttribute } from "proton-tsc/atomicassets";

@packer
export class Logmint extends InlineAction {
    constructor (
        public asset_id: u64 = 0,
        public minter: Name = new Name(),
        public collection: Name = new Name(),
        public schema: Name = new Name(),
        public template_id: i32 = 0,
        public new_owner: Name = new Name(),
        public immutable_data: AtomicAttribute[] = [],
        public mutable_data: AtomicAttribute[] = [],
        public backed_tokens: Asset[]=[],
        public immutable_template_data: AtomicAttribute[] = []
    ) {
        super();
    }
}