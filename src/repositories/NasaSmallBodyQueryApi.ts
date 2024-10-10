import { SupabaseClient } from '@supabase/supabase-js'
import { Trajectory } from '../types'
import { TrajectoryType } from '../types/Trajectory';
import config from '../globals/config.json'
import { FiltersContextType } from '../contexts';
import { Filters } from '../contexts/FiltersContext';
import tenKSB from '../assets/data/10k_sb.json'


class SmallBody {
    spkid: number;
    name: string;
    full_name: string;
    neo: boolean;
    pha: boolean;
    e: string;       // oE
    w: string;       // aP
    a: string;       // smA
    ma: string;      // mAe
    i: string;       // oI
    om: string;      // aN
    per_y: string;   // sidereal
    diameter: string;
    kind: string;

    constructor(args: any[]) {
        args = args.slice(2)
        this.spkid = args[0];
        this.name = args[1];
        this.full_name = args[2];
        this.neo = args[3];
        this.pha = args[4];
        this.e = args[5];
        this.w = args[6];
        this.a = args[7];
        this.ma = args[8];
        this.i = args[9];
        this.om = args[10];
        this.per_y = args[11];
        this.diameter = args[12];
        this.kind = args[13];
    }

    static fromObject(obj: any): SmallBody {
        return new SmallBody([
            null, null,
            obj.spkid, obj.name, obj.full_name,
            obj.neo, obj.pha,
            obj.e, obj.w, obj.a, obj.ma, obj.i, obj.om,
            obj.per_y, obj.diameter, obj.kind
        ])
    }

    toTrajectory(): Trajectory {
        let _type = TrajectoryType.Other
        if (this.pha) {
            _type = TrajectoryType.PHA
        } else if (this.neo) {
            _type = TrajectoryType.NEO
        }
        return new Trajectory(
            this.spkid.toString(),
            this.full_name.trim(),
            parseFloat(this.a),
            parseFloat(this.i),
            parseFloat(this.w),
            parseFloat(this.e),
            parseFloat(this.om),
            parseFloat(this.ma),
            parseFloat(this.per_y),
            parseFloat(this.diameter),
            _type,
            this.kind.startsWith('c') ? 'lightblue' : 'grey',
            false,
            this.kind
        )
    }
}

class NasaSmallBodyQueryApi {
    client: SupabaseClient;

    constructor() {
        this.client = new SupabaseClient(config.supabase.url, config.supabase.key)
    }

    async getSmallBodies(filters: FiltersContextType['filters'], attempt: number = 0): Promise<Trajectory[]> {
        let request = this.client.from('bodies').select('*')
        if (filters.query && filters.query !== '') {
            request = request.ilike('name', `%${filters.query}%`)
        }
        if (filters.group && filters.group !== 'all') {
            request = request.eq(Filters.mappings.group[filters.group], true)
        }
        if (filters.kind && filters.kind !== 'all') {
            request = request.ilike('kind', `${Filters.mappings.kind[filters.kind]}%`)
        }
        if (filters.numberedState && filters.numberedState !== 'all') {
            request = request.ilike('kind', `%${Filters.mappings.numberedState[filters.numberedState]}`)
        }
        if (filters.asteroidClasses && filters.asteroidClasses.length > 0 ||
            filters.cometClasses && filters.cometClasses.length > 0) {
            const ors = [...filters.asteroidClasses, ...filters.cometClasses]
            request = request.or(ors.join(', '))
        }
        const { data, error } = await request
            .order(filters.order, {ascending: filters.ascending, nullsFirst: false})
            .range(filters.range[0], filters.range[1])
        if (error) {
            console.log(error)
            if (attempt < 5) {
                return await this.getSmallBodies(filters, attempt + 1)
            }
            return []
        }
        const bodies = data.map((body: any) => SmallBody.fromObject(body))
        return bodies.map(body => body.toTrajectory())
    }

    async get10KBodies(): Promise<Trajectory[]> {
        const columns = tenKSB.fields;
        const rows = tenKSB.data;
        const result = rows.map(row =>
          row.reduce(
            (result, field, index) => ({ ...result, [columns[index]]: field }),
            {}
          )
        )
        result.forEach(body => {
            body.neo = body.neo === 'Y'
            body.pha = body.pha === 'Y'
        })
        return result.map(body => SmallBody.fromObject(body).toTrajectory())
    }
}

export default NasaSmallBodyQueryApi;
