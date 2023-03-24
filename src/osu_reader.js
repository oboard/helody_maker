let preTime = 2000;
let time = 0;
let content;
let TPnums = 0;
let BPMnums = 0;
let BPMs = {};
let Objs = {};
let HOnums = 0;
let scrollDuration = 500;
let MpB = 0;
let baseMpB = 0;
let percent = 100;
let BpB = 4;
let measure = BpB * MpB;
let p = 0;
let noteThick = 60;
let LineQueue = [{}, {}, {}, {}], LineQueueTail = [0, 0, 0, 0], LineQueueHead = [0, 0, 0, 0];
let timing = [16, 37, 70, 100, 123, 161];
let audio1 = document.getElementById("audioPlayer");
let keyAsync = [false, false, false, false];
let keyLaserTime = [0, 0, 0, 0];
let JudgeTime = 500;
let JudgeNew = 0;
let JudgeType = 0;
let FSType = false;
let LN = 0;
let Score = 0, EndScore = 0;
let Combo = 0;
let LineHold = [-1, -1, -1, -1];
let TouchHold = [-1, -1, -1, -1];
let LaserTime = 150;
let offset = -40;
let Scale = 100;
let Result = [0, 0, 0, 0, 0, 0, 0];
let FastCount = 0, SlowCount = 0, MaxCombo = 0;
const bindKey = [68, 70, 74, 75];

function parseOsuString(data) {
    let regex = {
        section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
        param: /^\s*([\w.\-_]+)\s*:\s*(.*?)\s*$/,
        param2: /^\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*$/,
        param3: /^\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*,\s*([?.\-\d]+)\s*/,
        comment: /^\s*\/\/.*$/
    };
    let value = {};
    let lines = data.split(/\r\n|\r|\n/);
    let section = null;
    lines.forEach(function (line) {
        if (regex.comment.test(line)) {
            return;
        } else if (regex.param.test(line)) {
            let match = line.match(regex.param);
            if (section) {
                value[section][match[1]] = match[2];
            } else {
                value[match[1]] = match[2];
            }
        } else if (regex.param2.test(line)) {
            let match = line.match(regex.param2);
            value[section][TPnums] = {};
            for (let i = 0; i < 8; i++)
                if (section) {
                    value[section][TPnums][i] = Number(match[1 + i]);
                }
            TPnums++;
        } else if (regex.param3.test(line)) {
            let match = line.match(regex.param3);
            value[section][HOnums] = {};
            for (let i = 0; i < 6; i++)
                if (section) {
                    value[section][HOnums][i] = Number(match[1 + i]);
                }
            HOnums++;
        } else if (regex.section.test(line)) {
            let match = line.match(regex.section);
            value[match[1]] = {};
            section = match[1];
        } else if (line.length === 0 && section) {
            section = null;
        };
    });
    // console.log(value);
    return value;
}
export function readOsu(contentString) {
    const content = parseOsuString(contentString);
    console.log(content);
    for (let i = 0; i < TPnums; i++)
        if (content["TimingPoints"][i][1] < 0) content["TimingPoints"][i][8] = BPMnums - 1; else {
            content["TimingPoints"][i][8] = BPMnums;
            BPMs[BPMnums] = {};
            BPMs[BPMnums][0] = content["TimingPoints"][i][0];
            BPMs[BPMnums][1] = content["TimingPoints"][i][1];
            BPMs[BPMnums][2] = content["TimingPoints"][i][2];
            BPMnums++;
        }
    for (let i = 0; i < HOnums; i++) {
        Objs[i] = {};
        Objs[i]["Key"] = Math.floor(content["HitObjects"][i][0] / (512 / 4));
        if (Objs[i]["Key"] >= 4) Objs[i]["Key"] = 3;
        Objs[i]["StartTime"] = content["HitObjects"][i][2];
        Objs[i]["EndTime"] = content["HitObjects"][i][5];
        if (Objs[i]["EndTime"] > 0) LN++;
        Objs[i]["Available"] = true;
        LineQueue[Objs[i]["Key"]][LineQueueTail[Objs[i]["Key"]]++] = i;
    }
    EndScore = (LN + HOnums) * 5;
    return {
        ...content,
        bpmList: BPMs,
        NoteList: Objs,
    }
}
function calcPOS(tt) {
    let p1 = p;
    while (p1 > 0 && tt < content["TimingPoints"][p1][0]) p1--;
    tt = Number(tt);
    let tpos = 0;
    let pos = 0;
    let MpB = 0;
    let c = 0;
    for (let i = p1; i < TPnums; i++) {
        MpB = BPMs[content["TimingPoints"][i][8]][1];
        if (content["TimingPoints"][i][1] > 0) percent = 1; else percent = -content["TimingPoints"][i][1] / 100;
        if (i === TPnums - 1 || content["TimingPoints"][i + 1][0] > time)
            c = (time - content["TimingPoints"][i][0]) * 800 / (scrollDuration * MpB * percent / baseMpB);
        else
            c = (content["TimingPoints"][i + 1][0] - content["TimingPoints"][i][0]) * 800 / (scrollDuration * MpB * percent / baseMpB);
        tpos = tpos + c;
        if (i === TPnums - 1 || content["TimingPoints"][i + 1][0] > time) break;
    }
    for (let i = p1; i < TPnums; i++) {
        MpB = BPMs[content["TimingPoints"][i][8]][1];
        if (content["TimingPoints"][i][1] > 0) percent = 1; else percent = -content["TimingPoints"][i][1] / 100;
        if (i === TPnums - 1 || content["TimingPoints"][i + 1][0] > tt)
            c = (tt - content["TimingPoints"][i][0]) * 800 / (scrollDuration * MpB * percent / baseMpB);
        else
            c = (content["TimingPoints"][i + 1][0] - content["TimingPoints"][i][0]) * 800 / (scrollDuration * MpB * percent / baseMpB);
        pos = pos + c;
        if (i === TPnums - 1 || content["TimingPoints"][i + 1][0] > tt) break;
    }

    return Number(pos - tpos);
}
function MissEvent(early) {
    Combo = 0;
    FSType = early;
    JudgeType = 6;
    Result[6]++;
    JudgeNew = time + JudgeTime;
    if (early) FastCount++; else SlowCount++;
}
function HitEvent(Key, number, early) {
    if (number < 5) Combo++; else Combo = 0;
    if (Combo > MaxCombo) MaxCombo = Combo;
    Score += 5 - number;
    FSType = early;
    JudgeType = number;
    if (number !== 0)
        if (early) FastCount++; else SlowCount++;
    Result[number]++;
    JudgeNew = time + JudgeTime;
}