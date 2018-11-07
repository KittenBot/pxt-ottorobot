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
    let _trim: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    let _degree: number[] = [90, 90, 90, 90, 90, 90, 90, 90];
    let _target: number[] = [90, 90, 90, 90, 90, 90, 90, 90];
    let _increment: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    let _amp: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    

    function setDegree(j: Joint, degree: number) {
        robotbit.Servo(servoIndex[j], degree + _trim[j])
        _degree[j] = degree;
        serial.writeLine(j + " " + degree)
    }


    function _moveServos(millis: number) {
        let steps: number;
        if (millis>10){
            steps = millis/10;
            for (let i = 0; i < 8; i++) {
                _increment[i] = (_target[i] - _degree[i])/steps;
            }
            for (let s=0;s<steps;s++){
                for (let i = 0; i < 8; i++) {
                    setDegree(i, _degree[i] + _increment[i])
                }
                basic.pause(10);
            }
        }
        for (let i = 0; i < 8; i++) {
            setDegree(i, _target[i])
        }
    }

    function _oscillateServos() {
        
    }

    //% blockId="ottoAttach" block="Attach |Joint %j|%s|Trim %t"
    //% weight=100
    export function ottoAttach(j: Joint, s: robotbit.Servos, t: number): void {
        servoIndex[j] = s;
        _trim[j] = t;
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
            if (move.charAt(i) == ' ' || move.charAt(i) == ','){
                _target[idx] = parseInt(move.substr(lastC, i-lastC));
                lastC = i;
                idx++;
            }
        }
        // last number
        _target[idx] = parseInt(move.substr(lastC, move.length - lastC));
        _moveServos(time);
    }



}
