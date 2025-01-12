function getMoveByName(moves, name) {
    return moves.find(move => move.name === name);
}

function main() {
    const moves = [
        { name: "LP", prop: "H", startUp: 4, damage: 1000, blockFrame: -2, punished: 0 },
        { name: "MP", prop: "H", startUp: 6, damage: 1500, blockFrame: +1, punished: 0 },
        { name: "HP", prop: "H", startUp: 10, damage: 2000, blockFrame: +3, punished: 0 },
        { name: "Throw", prop: "T", startUp: 5, damage: 1200, blockFrame: 0, punished: 0 },
        { name: "DP", prop: "I", startUp: 5, damage: 1400, blockFrame: 0, punished: 3000 },
        { name: "Block", prop: "B", startUp: 0, damage: 0, blockFrame: 0, punished: 0 },
    ];
    const mutekiKun = {
        name: "MutekiKun",
        play: (moves, frame) => {
            return moves.find(move => move.prop === "I");
        },
    }
    const blockKun = {
        name: "BlockKun",
        play: (moves, frame) => {
            return moves.find(move => move.prop === "B");
        },
    }
    const throwKun = {
        name: "ThrowKun",
        play: (moves, frame) => {
            return moves.find(move => move.prop === "T");
        },
    }
    const you = {
        name: "You",
        play: (moves, frame) => {
            if (frame >= 1) {
                return getMoveByName(moves, "Throw");
            }
            if (frame === 0) {
                return (Math.random() > 0.7) ? getMoveByName(moves, "Throw") : getMoveByName(moves, "LP");
            }
            return (Math.random() > 0.7) ? getMoveByName(moves, "DP") : getMoveByName(moves, "Block");
        },
    }
    playRounds(moves, you, throwKun, 10000);
    playRounds(moves, you, blockKun, 10000);
    playRounds(moves, you, mutekiKun, 10000);
}

function playRounds(moves, p1, p2, rounds) {
    let frame = 0; // p1視点
    let allDamage1 = 0;
    let allDamage2 = 0;
    for (let i = 0; i < rounds; i++) {
        let p1Move = p1.play(moves, frame);
        let p2Move = p2.play(moves, -frame);
        let { damage1, damege2, nextFrame } = getRoundResult(p1Move, p2Move, frame);
        frame = nextFrame;
        allDamage1 += damage1;
        allDamage2 += damege2;
    }
    console.log("-----");
    console.log(p1.name, allDamage1);
    console.log(p2.name, allDamage2);
    console.log(allDamage1 > allDamage2 ? `${p1.name} win` : `${p2.name} win`);
}

function getRoundResult(p1Move, p2Move, frame) {
    switch (p1Move.prop + p2Move.prop) {
        case "HH":
        case "HT":
            const effectiveP1Frame = p1Move.startUp - frame;
            if (effectiveP1Frame < p2Move.startUp) {
                return p1Hit(p1Move);
            }
            if (effectiveP1Frame > p2Move.startUp) {
                return p2Hit(p2Move);
            }
            return even();
        case "HI":
            return p2Hit(p2Move);
        case "HB":
            return { damage1: 0, damege2: 0, nextFrame: p1Move.blockFrame };
        case "TH":
            return invert(getRoundResult(p2Move, p1Move, -frame));
        case "TT":
            return even();
        case "TI":
            return p2Hit(p2Move);
        case "TB":
            return p1Hit(p1Move);
        case "IH":
            return invert(getRoundResult(p2Move, p1Move, -frame));
        case "IT":
            return invert(getRoundResult(p2Move, p1Move, -frame));
        case "II":
            return even();
        case "IB":
            return { damage1: 0, damege2: p1Move.punished, nextFrame: -5 }; // p1 punished
        case "BH":
            return invert(getRoundResult(p2Move, p1Move, -frame));
        case "BT":
            return invert(getRoundResult(p2Move, p1Move, -frame));
        case "BI":
            return invert(getRoundResult(p2Move, p1Move, -frame));
        case "BB":
            return even();
    }

    throw new Error("Invalid move");
}

function p1Hit(move) {
    return { damage1: move.damage, damege2: 0, nextFrame: 5 };
}

function p2Hit(move) {
    return { damage1: 0, damege2: move.damage, nextFrame: -5 };
}

function even() {
    return { damage1: 0, damege2: 0, nextFrame: 0 };
}

function invert(result) {
    return {
        damage1: result.damege2,
        damege2: result.damage1,
        nextFrame: -result.nextFrame,
    };
}
