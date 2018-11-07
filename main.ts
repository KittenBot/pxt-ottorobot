/*
Riven
modified from pxt-servo/servodriver.ts
load dependency
"robototto": "file:../pxt-robototto"
*/

//% color="#31C7D5" weight=10 icon="\uf17b"
namespace robototto {

    export enum Joint {
        RR = 0,
        RL = 1,
        YR = 2,
        YL = 3,
        AR = 4,
        AL = 5,
        HR = 6,
        HL = 7
    }

    let servoIndex: number[] = [0, 1, 2, 3, 4, 5, 6, 7];
    let trim: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    let movement: number[] = [0,0,0,0,0,0,0,0];

    function setDegree(j: Joint, degree: number) {
        robotbit.Servo(servoIndex[j], degree + trim[j])
    }

    //% blockId="ottoAttach" block="Attach |Joint %j|%s|Trim %t"
    //% weight=100
    export function ottoAttach(j: Joint, s: robotbit.Servos, t: number): void {
        servoIndex[j] = s;
        trim[j] = t;
        setDegree(j, 90)
    }

    //% blockId="ottoHome" block="Otto Home"
    //% weight=100
    export function ottoHome(): void {
        for (let i = 0; i < 8; i++) {
            setDegree(i, 90);
        }
    }

    /**
     * @param time time for move; eg: 600
     * @param move movements; eg: "90 90 90 90"
    */
    //% blockId="moveServos" block="Move Servo |%time|%move"
    //% weight=99
    export function moveServos(time: number, move: string): void {
        let idx = 0;
        let lastC = 0;
        for (let i=0;i<move.length;i++){
            if (move.charAt(i) == ' ' || move.charAt(i) == '\0'){
                movement[idx] = parseInt(move.substr(lastC, i-lastC));
                lastC = i;
                idx++;
            }
        }
        movement[idx] = parseInt(move.substr(lastC, move.length - lastC));

    }



}
