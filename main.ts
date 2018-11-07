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

    export enum WalkDir {
        Forward = 0,
        Back = 1
    }

    export enum TurnDir {
        Left = 0,
        Right = 1
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

    function _moveServosLower(millis: number, m: number[]) {
        _target[0] = m[0]
        _target[1] = m[1]
        _target[2] = m[2]
        _target[3] = m[3]
        _moveServos(millis);
    }

    function setDegreePh(j: Joint, A: number, O: number, ph: number) {
        // use sin function to make servo sweep
        let pos: number = Math.round(A * Math.sin(ph / 180 * Math.PI) + O)
        setDegree(j, pos + 90) // 90 degree = phase 0
    }

    function _oscillateServos(period: number, cycle: number) {
        let _ph: number[] = _phase;
        // 1 period = 2*pi
        const step = 20; // ms for each step
        let totalSteps = period * cycle / step;
        let _inc = 360 * step / period; //phase increase for each 10ms

        for (let s = 0; s < totalSteps; s++) {
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
        for (let i = 0; i < 8; i++) {
            serial.writeLine(i + " " + ary[i])
        }
    }

    //% blockId="ottoHome" block="Otto Home"
    //% weight=100
    export function ottoHome(): void {
        for (let i = 0; i < 8; i++) {
            _target[i] = 90;
        }
        _moveServos(1000);
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

    //% blockId="ottoJump" block="Otto Jump |%time ms"
    //% weight=80
    export function ottoJump(time: number): void {
        _moveServosLower(time, [90, 90, 150, 30]);
        ottoHome();
    }

    //% blockId="ottoWalk" block="Otto Walk |%time ms|Dir %dir|Steps %step"
    //% weight=80
    export function ottoWalk(time: number, dir: WalkDir, step: number): void {
        let tmp = (dir == WalkDir.Forward) ? -1 : 1;
        _amp[0] = 30; _amp[1] = 30; _amp[2] = 20; _amp[3] = 20;
        _offset[0] = 0; _offset[1] = 0; _offset[2] = 4; _offset[3] = -4;
        _phase[0] = 0; _phase[1] = 0; _phase[2] = -90 * dir; _phase[3] = -90 * dir;
        _oscillateServos(time, step);
    }

    //% blockId="ottoTurn" block="Otto Turn |%time ms|Dir %dir|Steps %step"
    //% weight=80
    export function ottoTurn(time: number, dir: TurnDir, step: number): void {
        _amp[0] = 30; _amp[1] = 30; _amp[2] = 20; _amp[3] = 20;
        _offset[0] = 0; _offset[1] = 0; _offset[2] = 4; _offset[3] = -4;
        _phase[0] = 0; _phase[1] = 0; _phase[2] = -90 * dir; _phase[3] = -90 * dir;
        if (dir == TurnDir.Left) {
            _amp[0] = 30;
            _amp[1] = 10;
        } else {
            _amp[0] = 10;
            _amp[1] = 30;
        }
        _oscillateServos(time, step);
    }

    //% blockId="ottoBend" block="Otto Bend |%time ms|Dir %dir|Step %step"
    //% weight=80
    export function ottoBend(time: number, dir: number, step: number): void {
        let bend1 = [90, 90, 62, 35];
        let bend2 = [90, 90, 62, 105];
        if (dir < 0) {
            bend1[2] = 180 - 35;
            bend1[3] = 180 - 65;
            bend2[2] = 180 - 105;
            bend2[3] = 180 - 60;
        }
        for (let j = 0; j < step; j++) {
            _moveServosLower(400, bend1)
            _moveServosLower(400, bend2)
            basic.pause(time * 0.8)
            ottoHome()
        }
    }

    //% blockId="shakeLeg" block="Shake Leg |%time ms|Dir %dir|Steps %step"
    //% weight=80
    export function shakeLeg(T: number, dir: number, step: number): void {
        let shake_leg1 = [90, 90, 58, 35];
        let shake_leg2 = [90, 90, 58, 120];
        let shake_leg3 = [90, 90, 58, 60];
        if (dir<0){
            shake_leg1[2]=180-35;
            shake_leg1[3]=180-58;
            shake_leg2[2]=180-120;
            shake_leg2[3]=180-58;
            shake_leg3[2]=180-60;
            shake_leg3[3]=180-58;
        }
        let numberLegMoves = 2;
        //Time of the bend movement. Fixed parameter to avoid falls
        let T2= 1000;
        //Time of one shake, constrained in order to avoid movements too fast.            
        T = T - T2;
        T = Math.max(T, 200 * numberLegMoves);  
        for (let j= 0; j < step;j++)
        {
            //Bend movement
            _moveServosLower(T2 / 2, shake_leg1);
            _moveServosLower(T2 / 2, shake_leg2);

            //Shake movement
            for (let i= 0; i < numberLegMoves;i++)
            {
                _moveServosLower(T / (2 * numberLegMoves), shake_leg3);
                _moveServosLower(T / (2 * numberLegMoves), shake_leg2);
            }
            ottoHome()
        }
        basic.pause(T)
    }

    //% blockId="ottoUpdown" block="Otto Updown |%time ms|Height %h|Steps %step"
    //% weight=80
    export function ottoUpdown(time: number, h: number, step: number): void {
        _amp[0] = 0; _amp[1] = 0; _amp[2] = h; _amp[3] = h;
        _offset[0] = 0; _offset[1] = 0; _offset[2] = h; _offset[3] = -h;
        _phase[0] = 0; _phase[1] = 0; _phase[2] = -90; _phase[3] = 90;
        _oscillateServos(time, step);
    }

    //% blockId="ottoSwing" block="Otto Swing |%time ms|Swing %h|Steps %step"
    //% weight=80
    export function ottoSwing(time: number, h: number, step: number): void {
        _amp[0] = 0; _amp[1] = 0; _amp[2] = h; _amp[3] = h;
        _offset[0] = 0; _offset[1] = 0; _offset[2] = h/2; _offset[3] = -h/2;
        _phase[0] = 0; _phase[1] = 0; _phase[2] = 0; _phase[3] = 0;
        _oscillateServos(time, step);
    }

    //% blockId="ottoJitter" block="Otto Jitter |%time ms|Height %h|Steps %step"
    //% weight=80
    export function ottoJitter(time: number, h: number, step: number): void {
        h = Math.min(25,h);
        _amp[0] = h; _amp[1] = h; _amp[2] = 0; _amp[3] = 0;
        _offset[0] = 0; _offset[1] = 0; _offset[2] = 0; _offset[3] = 0;
        _phase[0] = -90; _phase[1] = 90; _phase[2] = 0; _phase[3] = 0;
        _oscillateServos(time, step);
    }

    //% blockId="ottoMoonWalk" block="Otto Moon Walk |%time ms|Height %h|Steps %step"
    //% weight=80
    export function ottoMoonWalk(time: number, h: number, step: number): void {
        _amp[0] = h; _amp[1] = h; _amp[2] = h; _amp[3] = h;
        _offset[0] = 0; _offset[1] = 0; _offset[2] = h / 2 + 2; _offset[3] = -h / 2 - 2;
        let phi = -90;
        _phase[0] = 0; _phase[1] = 0; _phase[2] = phi; _phase[3] = -60+phi;
        _oscillateServos(time, step);
    }

    //% blockId="ottoFlapping" block="Otto Flapping |%time ms|Height %h|Steps %step"
    //% weight=80
    export function ottoFlapping(time: number, h: number, step: number): void {
        let dir = 1;
        _amp[0] = 12; _amp[1] = 12; _amp[2] = h; _amp[3] = h;
        _offset[0] = 0; _offset[1] = 0; _offset[2] = h -10; _offset[3] = -h +10;
        _phase[0] = 0; _phase[1] = 180; _phase[2] = -90*dir; _phase[3] =90*dir;
        _oscillateServos(time, step);
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
