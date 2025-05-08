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
        for (var i = 0; i < CrashChances.length / 3; i++) {
            if (value < CrashChances[i * 3 + 2] / 100) {
                this.maxIndex = i;
                this.multiplier = CrashChances[i * 3 + 1];
                return; 
            }
        }
    }

    onTick = () => {
        if (this.crashed) return;

        this.iterator++;
        if (this.iterator >= CrashChances.length / 4) this.crashed = true;
        else {
            this.crashChance = CrashChances[this.iterator * 3 + 2];
            this.multiplier = CrashChances[this.iterator * 3 + 1];
            
            if (this.iterator >= this.maxIndex) {
                this.crashed = this.canCrash;
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