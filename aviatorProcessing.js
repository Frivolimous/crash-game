function processData() {
    var historicObj = stake_data.split('\n');
    console.log(historicObj.length);
    var uniques = [];
    historicObj.forEach(el => uniques.includes(el) ? null : uniques.push(el));
    uniques.sort();
    
    console.log("C", uniques.length);
    var uniqueCount = [];

    historicObj.forEach(el => {
        for (var i in uniques) {
            if (uniques[i] === el) {
                uniqueCount[i] = (uniqueCount[i] || 0) + 1;
            }
        }
    });

    console.log("C");

    var uniques = {};
    historicObj.forEach(el => uniques[el] = (uniques[el] || 0) + 1);
    console.log("D");
    var m = Object.entries(uniques);

    console.log("A");
    console.log(m.map(el => el.join('\t')).join('\n'));
    console.log("B");
}

function processMult() {
    var historicObj = stake_data.split('\n');

    var maxOneGap = 0;
    var numAdjacentOnes = 0;

    var maxTenPlusGap = 0;
    var numAdjacentTenPlus = 0;

    var numOnes = 0;
    var numTenPlus = 0;

    var lastOne = -1;
    var lastTenPlus = -1;

    historicObj.forEach((el, i) => {
        el = Number(el);
        if (el <= 1) {
            numOnes++;
            if (lastOne < 0) {
                lastOne = i;
            } else {
                var oneGap = i - lastOne;
                lastOne = i;

                maxOneGap = Math.max(maxOneGap, oneGap);
                if (oneGap === 1) {
                    numAdjacentOnes++;
                }
            }
        }

        if (el >= 10) {
            numTenPlus++;
            if (lastTenPlus < 0) {
                lastTenPlus = i;
            } else {
                var tenGap = i - lastTenPlus;
                lastTenPlus = i;

                maxTenPlusGap = Math.max(maxTenPlusGap, tenGap);
                if (tenGap === 1) {
                    numAdjacentTenPlus++;
                }
            }
        }
    });

    console.log(numOnes, maxOneGap, numAdjacentOnes);
    console.log(numTenPlus, maxTenPlusGap, numAdjacentTenPlus);
}


// processData();