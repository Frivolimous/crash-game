class CrashManager {
    static simulateResults(count) {
        var simulator = new CrashManager();

        var results = [];

        for (var i = 0; i < count; i++) {
            simulator.fakeResult();
            results.push(Math.round(simulator.multiplier * 100) / 100);
        }
        
        return results;
    }

    
    canCrash = true;
    useFormula = true;

    multiplier = 0;
    crashed = false;
    crashChance = 0;

    iterator = 0;
    multiplier = 0;
    baseMult = 1;
    incMult = 0.1;
    maxIndex = 0;

    reset = () => {
        this.iterator = 0;
        this.multiplier = 1;
        this.crashed = false;


        var value = Math.random();
        if (this.useFormula) {
            this.multiplier = this.getCrashMult(value);
            this.maxIndex = this.getTotalTicks(this.multiplier);
        } else {
            for (var i = 0; i < CrashChances.length / 3; i++) {
                if (value < CrashChances[i * 3 + 2] / 100) {
                    this.maxIndex = i;
                    this.multiplier = CrashChances[i * 3 + 1];
                    return; 
                }
            }
        }
    }

    f_min = 1;
    f_max = 1000;
    f_rtp = 0.99;
    f_start = 0.9;
    f_inc = 0.00395;
    f_ex = 2;
    f_a = 300;
    f_b = 30;

    getCrashMult(random) {
        return Math.max(Math.min(this.f_rtp / (1 - random), this.f_max), this.f_min);
    }

    getTotalTicks(mult) {
        // return Math.pow(mult - this.f_start, 1 / this.f_ex) / this.f_inc;
        return ((this.f_a * Math.log(mult - 0) + this.f_b));
    }

    getMultForI(iterator) {
        // return Math.round((this.f_start + Math.pow(iterator * this.f_inc, this.f_ex)) * 1000) / 1000;
        return Math.exp((iterator - this.f_b) / this.f_a);
    }

    getCrashChanceFor(mult) {
        if (mult < this.f_min) return 0;

        return Math.round(Math.max(1 - this.f_rtp / mult, 0) * 100) / 100;
    }

    onTick = () => {
        if (this.crashed) return;

        this.iterator++;
        if (this.useFormula) {
            var max = 1000;
            this.multiplier = this.getMultForI(this.iterator);
            if (this.multiplier >= max) {
                this.crashed = true;
                return;
            }
            this.crashChance = this.getCrashChanceFor(this.multiplier) * 100;

            if (this.iterator >= this.maxIndex) {
                this.crashed = this.canCrash;
            }
        } else {
            if (this.iterator >= CrashChances.length / 4) this.crashed = true;
            else {
                this.crashChance = CrashChances[this.iterator * 3 + 2];
                this.multiplier = CrashChances[this.iterator * 3 + 1];
                
                if (this.iterator >= this.maxIndex) {
                    this.crashed = this.canCrash;
                }
            }
        }
    }

    fakeResult() {
        this.reset();
        while(!this.crashed) {
            this.onTick();
        }
    }
}

const CrashChances = CrashChances99;