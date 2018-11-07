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
    let _offset: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
    // note: all serveo share same period
    let _period: number = 2000;
    let _phase: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

    function setDegree(j: Joint, degree: number) {
        robotbit.Servo(servoIndex[j], degree + _trim[j])
        _degree[j] = degree;
    }


    function _moveServos(millis: number) {
        let steps: number;
        if (millis > 20) {
            steps = millis / 20;
            for (let i = 0; i < 8; i++) {
                _increment[i] = (_target[i] - _degree[i]) / steps;
            }
            for (let s = 0; s < steps; s++) {
                for (let i = 0; i < 8; i++) {
                    setDegree(i, _degree[i] + _increment[i])
                }
                basic.pause(6); //optimized
            }
        }
        for (let i = 0; i < 8; i++) {
            setDegree(i, _target[i])
        }
    }

    function setDegreePh(j: Joint, A: number, O: number, ph: number) {
        // use sin function to make servo sweep
        let pos: number = Math.round(A*Math.sin(ph/180*Math.PI)+O)
        setDegree(j, pos+90) // 90 degree = phase 0
    }

    function _oscillateServos(period: number, cycle: number) {
        let _ph: number[] = _phase;
        // 1 period = 2*pi
        const step = 20; // ms for each step
        let totalSteps = period * cycle / step;
        let _inc = 360 * step / period; //phase increase for each 10ms

        for (let s=0;s<totalSteps;s++){
            for (let i = 0; i < 8; i++) {
                setDegreePh(i, _amp[i], _offset[i], _ph[i]);
                _ph[i] += _inc;
            }
            basic.pause(step);
        }
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

    function parseAry(str: string, ary: number[]) {
        let idx = 0;
        let lastC = 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charAt(i) == ' ' || str.charAt(i) == ',') {
                ary[idx] = parseInt(str.substr(lastC, i - lastC));
                lastC = i;
                idx++;
            }
        }
        // last number
        ary[idx] = parseInt(str.substr(lastC, str.length - lastC));
        for (let i=0;i<8;i++){
            serial.writeLine(i+" "+ ary[i])
        }
    }

    /**
     * @param time time for move; eg: 600
     * @param move movements; eg: "90 90 90 90"
    */
    //% blockId="moveServos" block="Move Servo |%time ms|%move"
    //% weight=99
    export function moveServos(time: number, move: string): void {
        parseAry(move, _target);
        _moveServos(time);
    }

    /**
     * @param amp movements; eg: "90 90 90 90"
    */
    //% blockId="oscAmplitude" block="Osc AMP |%amp"
    //% weight=10
    //% advanced=true
    export function oscAmplitude(amp: string): void {
        parseAry(amp, _amp);
    }

    /**
     * @param offset movements; eg: "0 0 0 0"
    */
    //% blockId="oscOffset" block="Osc offset |%offset"
    //% weight=10
    //% advanced=true
    export function oscOffset(offset: string): void {
        parseAry(offset, _offset);
    }

    /**
     * @param phase movements; eg: "0 0 0 0"
    */
    //% blockId="oscPhase" block="Osc phase |%phase"
    //% weight=10
    //% advanced=true
    export function oscPhase(phase: string): void {
        parseAry(phase, _phase);
    }


    //% blockId="Oscillate" block="Oscillate Servos |Period %period|Cycles %cycle"
    //% weight=10
    //% advanced=true
    export function Oscillate(period: number, cycle: number): void {
        _oscillateServos(period, cycle);
    }

}
