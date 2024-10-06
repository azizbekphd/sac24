import { SupabaseClient } from '@supabase/supabase-js'
import { Trajectory } from '../types'
import { TrajectoryType } from '../types/Trajectory';
import config from '../globals/config.json'
import { FiltersContextType } from '../contexts';
import { Filters } from '../contexts/FiltersContext';


class SmallBody {
    spkid: number;
    name: string;
    full_name: string;
    neo: string;
    pha: string;
    e: string;       // oE
    w: string;       // aP
    a: string;       // smA
    ma: string;      // mAe
    i: string;       // oI
    om: string;      // aN
    per_y: string;   // sidereal
    diameter: string;

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
    }

    static fromObject(obj: any): SmallBody {
        return new SmallBody([
            null, null,
            obj.spkid, obj.name, obj.full_name,
            obj.neo, obj.pha,
            obj.e, obj.w, obj.a, obj.ma, obj.i, obj.om,
            obj.per_y, obj.diameter
        ])
    }

    toTrajectory(): Trajectory {
        let _type = TrajectoryType.Other
        if (this.neo === 'Y') {
            _type = TrajectoryType.NEO
        } else if (this.pha === 'Y') {
            _type = TrajectoryType.PHA
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
        )
    }
}

class NasaSmallBodyQueryApi {
    client: SupabaseClient;

    constructor() {
        this.client = new SupabaseClient(config.supabase.url, config.supabase.key)
    }

    async getSmallBodies(filters: FiltersContextType['filters']): Promise<Trajectory[]> {
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
        const { data, error } = await request
            .order(filters.order, {ascending: filters.ascending, nullsFirst: false})
            .range(filters.range[0], filters.range[1])
        if (error) {
            console.log(error)
            return []
        }
        const bodies = data.map((body: any) => SmallBody.fromObject(body))
        return bodies.map(body => body.toTrajectory())
    }

    async getSmallBodiesFromFile(chunk: number = 0): Promise<Trajectory[]> {
        const file = `/data/small_bodies_${chunk}.json`
        const response = await fetch(file)
        const data = await response.json()
        const bodies = (data.data as any[]).map((body: string[]) => new SmallBody(body))
        return bodies.map(body => body.toTrajectory())
    }
}

export default NasaSmallBodyQueryApi;
