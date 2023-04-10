<template>
  <div class="flex flex-row flex-1 h-full">
    <div class="flex-1">
      <canvas class="h-full w-full" @mouseup="onMouseUp" />
    </div>
    <div class="flex-1 w-0.5 select-none h-full">
      <div class="flex flex-col h-full">
        <div class="flex flex-row items-center h-8 shrink-0">
          <span class="flex justify-center items-center p-4">Helody Maker</span>
          <Dropdown>
            <Button type="text">
              文件
              <Icon type="ios-arrow-down"></Icon>
            </Button>
            <template #list>
              <DropdownMenu>
                <DropdownItem @click="handleClear">新建</DropdownItem>
                <DropdownItem @click="handleImport">打开</DropdownItem>
                <DropdownItem @click="handleExport">导出</DropdownItem>
                <DropdownItem divided>取消</DropdownItem>
              </DropdownMenu>
            </template>
          </Dropdown>
          <Dropdown>
            <Button type="text">
              编辑
              <Icon type="ios-arrow-down"></Icon>
            </Button>
            <template #list>
              <DropdownMenu>
                <DropdownItem @click="informationModal = true">歌曲信息</DropdownItem>
              </DropdownMenu>
            </template>
          </Dropdown>
          <Dropdown>
            <Button type="text">
              生成
              <Icon type="ios-arrow-down"></Icon>
            </Button>
            <template #list>
              <DropdownMenu>
                <DropdownItem @click="generate('every')">每个节拍</DropdownItem>
                <DropdownItem @click="generate('random')">随机排列</DropdownItem>
              </DropdownMenu>
            </template>
          </Dropdown>
        </div>
        <div class="flex flex-row">
          <div class="flex flex-col flex-1">
            <Card class="flex-1" style="width:100%">
              <template #title>
                <Icon type="ios-musical-notes"></Icon>
                音乐控制器 {{ namesong }}
              </template>

              <div class="flex items-center flex-col">
                <audio class="" ref="audio" controls="controls" :preload="preload">
                  <source />
                </audio>
                <Form>
                  <FormItem label="倍速">
                    <RadioGroup v-model="playSpeed" type="button" @change="speedChange">
                      <Radio :label="1"></Radio>
                      <Radio :label="2"></Radio>
                      <Radio :label="4"></Radio>
                      <Radio :label="8"></Radio>
                    </RadioGroup>
                  </FormItem>
                </Form>
                <ButtonGroup shape="circle">
                  <Button type="info" title="上一首" size="large" @click="up(Indexsong)">
                    <Icon type="ios-arrow-back" />
                  </Button>
                  <!-- <Button type="info" title="播放/暂停" size="large" @click="play(namesong, Indexsong)">
                      <Icon :type="playButton" />
                    </Button> -->
                  <Button type="info" title="下一首" size="large" @click="down(Indexsong)">
                    <Icon type="ios-arrow-forward" />
                  </Button>
                  <!-- <Button type="info" title="列表" size="large" @click="IssongListshowhide">
                      <Icon type="ios-list" />
                    </Button> -->
                </ButtonGroup>
              </div>
              <Table :columns="columns" :data="songList" v-show="songListhidden" @click="IssongListshowhide"></Table>
            </Card>
            <Card class="flex-1" style="width:100%">
              <template #title>
                <Icon type="ios-musical-notes"></Icon>
                节奏控制器
              </template>
              <Form :model="clipControllerData" :label-width="80">
                <FormItem label="片段">
                  <Slider v-model="editingClipIndex" :min="0" :max="beatmap.clips.length - 1" show-input></Slider>
                </FormItem>
                <ButtonGroup shape="circle">
                  <Button type="info" title="删除此片段" size="large" @click="deleteClip">
                    <Icon type="ios-trash" />删除
                  </Button>
                  <Button type="info" title="清空此片段" size="large" @click="clearClip">
                    <Icon type="ios-trash-outline" />清空
                  </Button>
                  <Button type="info" title="添加片段" size="large" @click="addClip">
                    <Icon type="ios-add" />添加
                  </Button>
                </ButtonGroup>
                <FormItem label="BPM">
                  <Slider v-model="beatmap.clips[editingClipIndex].bpm" :min="-2000" :max="2000" show-input></Slider>
                </FormItem>
                <FormItem label="对其">
                  <RadioGroup v-model="noteAlign" type="button">
                    <Radio label="1"></Radio>
                    <Radio label="2"></Radio>
                    <Radio label="4"></Radio>
                    <Radio label="8"></Radio>
                    <Radio label="16"></Radio>
                    <Radio label="32"></Radio>
                    <Radio label="64"></Radio>
                  </RadioGroup>
                </FormItem>
              </Form>

            </Card>
          </div>
          <!-- <Card class="flex-1" style="width:100%">
              <template #title>
                <Icon type="ios-musical-notes"></Icon>
                参数设置
              </template>
              
            </Card> -->
        </div>
        <div class="overflow-x-scroll overflow-y-clip p-4">
          <span>空格：播放▶️/暂停⏸️｜z/x:打点｜b:计算BPM<span class="text-blue-500">[{{ calBPM }}]</span>
            ｜c:清空BPM计算列表｜⬅️➡️:x位移｜⬆️⬇️:时移｜d:克隆｜p:属性窗口｜e:效果窗口</span>

        </div>
        <Card class="" style="width:100%">
          <template #title>
            <Icon type="ios-infinite" />
            波形显示器
          </template>
          <div id="zoomview-container" class="h-16" ref="zoomview"></div>
          <div id="overview-container" class="h-16" ref="overview"></div>
        </Card>
        <span class="flex-1 overflow-y-scroll">
          {{ JSON.stringify(beatmap) }}
        </span>
      </div>
    </div>

  </div>
  <Modal v-model="informationModal" draggable sticky scrollable :mask="false" title="歌曲信息">
    <Form :model="formItem" :label-width="80">
      <FormItem label="歌名">
        <Input v-model="beatmap.name" placeholder="Enter something..."></Input>
      </FormItem>
      <!-- <FormItem label="Select">
            <Select v-model="beatmap.select">
              <Option value="beijing">New York</Option>
              <Option value="shanghai">London</Option>
              <Option value="shenzhen">Sydney</Option>
            </Select>
          </FormItem> -->
      <FormItem label="创作日期">
        <!-- <Row> -->
        <!-- <Col span="11"> -->
        <DatePicker type="date" placeholder="选择日期" v-model="beatmap.createDate"></DatePicker>
        <!-- </Col> -->
        <!-- <Col span="2" style="text-align: center">-</Col>
              <Col span="11">
              <TimePicker type="time" placeholder="选择时间" v-model="beatmap.time"></TimePicker> -->
        <!-- </Col> -->
        <!-- </Row> -->
      </FormItem>
      <!-- <FormItem label="Radio">
            <RadioGroup v-model="beatmap.radio">
              <Radio label="male">Male</Radio>
              <Radio label="female">Female</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="Checkbox">
            <CheckboxGroup v-model="beatmap.checkbox">
              <Checkbox label="Eat"></Checkbox>
              <Checkbox label="Sleep"></Checkbox>
              <Checkbox label="Run"></Checkbox>
              <Checkbox label="Movie"></Checkbox>
            </CheckboxGroup>
          </FormItem> -->
      <!-- <FormItem label="Switch">
            <i-switch v-model="beatmap.switch" size="large">
              <template #open>
                <span>On</span>
              </template>
              <template #close>
                <span>Off</span>
              </template>
            </i-switch>
          </FormItem> -->
      <FormItem label="难度等级">
        <Slider v-model="beatmap.difficulty" :min="1" :max="20" show-input></Slider>
      </FormItem>
      <FormItem label="歌手">
        <Input v-model="beatmap.artist" placeholder="Enter something..."></Input>
      </FormItem>
      <FormItem label="谱师">
        <Input v-model="beatmap.creator" placeholder="Enter something..."></Input>
      </FormItem>
      <FormItem label="简介">
        <Input v-model="beatmap.description" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }"
          placeholder="Enter something..."></Input>
      </FormItem>
    </Form>
  </Modal>
  <Modal v-model="propModal" draggable sticky scrollable :mask="false" title="属性">
    <div class="overflow-y-scroll max-h-full"
      v-if="beatmap.clips[editingClipIndex].notes.length > 0 && beatmap.clips[editingClipIndex].notes[selectedIndex]">
      <Form inline>
        <FormItem :label="key" v-for="key in Object.keys(currentNote)">
          <InputNumber v-if="typeof (currentNote[key]) === 'number'" v-model="currentNote[key]"></InputNumber>
          <Input v-if="typeof (currentNote[key]) === 'string' && typeof (currentNote[key]) === 'null'"
            v-model="currentNote[key]"></Input>
        </FormItem>
      </Form>
    </div>
  </Modal>
  <Modal v-model="effectModal" draggable sticky scrollable :mask="false" title="特效">
    <div
      v-if="beatmap.clips[editingClipIndex].notes.length > 0 && beatmap.clips[editingClipIndex].notes[selectedIndex] && beatmap.clips[editingClipIndex].notes[selectedIndex].effects"
      class="overflow-y-scroll max-h-full divide-y-2 divide-slate-400 divide-dashed">
      <div v-for="effect in beatmap.clips[editingClipIndex].notes[selectedIndex].effects">
        <Form inline>
          <FormItem label="类型">
            <Select v-model="effect.type" filterable>
              <OptionGroup v-for="group in effectTypeGroups" :label="group.name">
                <Option v-for="item in group.list" :value="item" :key="item">{{ item }}</Option>
              </OptionGroup>
            </Select>
          </FormItem>
          <FormItem label="开始时刻">
            <InputNumber v-model="effect.start"></InputNumber>
          </FormItem>
          <FormItem label="结束时刻">
            <InputNumber v-model="effect.end"></InputNumber>
          </FormItem>
          <FormItem v-if="effect.type.startsWith('move')" label="起始位移">
            <InputNumber :max="100" :min="-100" v-model="effect.startValue" controls-outside></InputNumber>
          </FormItem>
          <FormItem v-if="effect.type.startsWith('move')" label="终止位移">
            <InputNumber :max="100" :min="-100" v-model="effect.endValue" controls-outside></InputNumber>
          </FormItem>
          <FormItem label="曲线">
            <Select v-model="effect.curve" filterable>
              <Option v-for="item in curveList" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </FormItem>
          <FormItem v-if="effect.type == 'rotate'" label="起始角度">
            <InputNumber :max="360000" :min="0" v-model="effect.startValue" controls-outside></InputNumber>
          </FormItem>
          <FormItem v-if="effect.type == 'rotate'" label="终止角度">
            <InputNumber :max="360000" :min="0" v-model="effect.endValue" controls-outside></InputNumber>
          </FormItem>
        </Form>
      </div>
      <!-- <Button @click="beatmap.clips[editingClipIndex].notes[selectedIndex].effects.remove(effect)">删除</Button> -->
    </div>
    <Button @click="addEffect('moveX')">添加</Button>
  </Modal>
  <input type="file" @change="loadFile" id="fileInput" style="display:none" />
</template>
  
<script>
import Peaks from 'peaks.js';
import { readOsu } from './osu_reader.js';
import Curves from './utils/curves.js';
export default {
  data() {
    return {
      audio: {},
      noteAlign: "1",
      leftOffset: 300,
      triggerDragging: false,
      selectedIndex: 0,
      currentTime: 0,
      inputing: false,
      effectTypeGroups: [
        {
          name: 'Transform',
          list: [
            'rotate',
            'moveX',
            'moveY',
            'skew',
            'scale',
            'opacity'
          ]
        },
        {
          name: 'Clip',
          list: [
            'clipRotate',
            'clipOpacity',
            'clipVibration'
          ]
        }
      ],
      beatmap: {
      },
      calBPM: 100,
      calBPMList: [0,],
      editingClipIndex: 0,
      optiontype: ["up", "play", "down"],
      preload: "auto",
      Indexsong: 0,
      namesong: "",
      curveList: Curves.nameList,
      effectModal: false,
      propModal: false,
      informationModal: false,
      playButton: "ios-play",
      playSpeed: 1,
      bpm: 90,
      musicUrl: "",
      currentTime: 0,
      path: "/Music/",
      columns: [
        {
          type: "index",
          title: "序号",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h("span", params.index);
          }
        },
        {
          title: "歌曲",
          key: "song"
        },
        {
          title: "操作",
          render: (h, params) => {
            return h("div", [
              h("Button", {
                props: {
                  type: "info",
                  size: "small"
                },
                style: {
                  marginRight: "5px"
                },
                on: {
                  click: () => {
                    this.play(params.row.song, params.index);
                  }
                }
              }, "播放")
            ]);
          }
        }
      ],
      songList: [
        {
          song: "Barroom Ballet.mp3",
        },
        {
          song: "Beat Thee.mp3",
        },
        {
          song: "Bit Bit Loop.mp3",
        },
      ],
      songListhidden: false
    };
  },
  // computed: {  ///存在问题，未能 到底预期效果以换他方式created里实现
  //     namesong:{
  //       // setter
  //       get() {    
  //         console.log("get:"+)
  //         return this.songList[1].song;
  //       }
  //       ,
  //        set(newval) {  
  //         console.log("set:"+newval)  
  //         return newval;
  //       }
  //       }
  //   },
  computed: {
    currentClip() {
      return this.beatmap.clips[this.editingClipIndex];
    },
    currentNote() {
      const c = this.currentClip.notes[this.selectedIndex];
      if (c)
        return c;
      else
        return null;
    }
  },
  methods: {
    generate(type) {
      switch (type) {
        case 'every':
          for (let i = 0; i < this.audio.duration / 60 * this.currentClip.bpm; i += Number(this.noteAlign)) {
            this.currentClip.notes.push({
              start: i,
              x: 0,
            })
          }
          break;
        case 'random':
          this.currentClip.notes.map(note => {
            note.x = Math.round((Math.random() - 0.5) * 64);
          });
          break;
      }
    },
    onMouseUp(event) {
      if (this.currentClip == undefined) return;
      let canvas = document.getElementsByTagName('canvas')[0];
      let w = canvas.width;
      let h = canvas.height;
      var dpr = window.devicePixelRatio || 1;
      let now = this.currentTime * this.currentClip.bpm / 60;
      let view = this.currentClip.bpm * 8;
      let blockHeight = 64;
      // let ceilHeight = 16;
      // console.log(Math.floor(event.clientX*dpr/w*10));
      window.clientX = event.offsetX * dpr;
      window.clientY = event.offsetY * dpr;

      let nearest = 0;
      let distance = 100000000000000;
      let elements = this.currentClip.notes.filter(function (item, index, array) {
        return item.start / 60 > now - view && item.start / 60 < now + view;
      });

      for (let index in elements) {
        const item = elements[index];
        let d = Math.pow(w / 2 + item.x / 100 * w - window.clientX, 2) + Math.pow(h / 2 - (item.start - now + 0.1) * blockHeight - window.clientY, 2);
        if (distance >= d) {
          nearest = this.currentClip.notes.indexOf(item);
          distance = d;
        }
        // ctx.fillStyle = "#0000ff88";
        // ctx.fillRect(w / 2 - 64 + item.x/100*w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
        // if (index == this.selectedIndex)
        //     ctx.strokeStyle = "#00ff00";
        // else
        //     ctx.strokeStyle = "#fff";

        // ctx.strokeRect(w / 2 - 64 + item.x/100*w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
      }
      console.log(nearest);
      this.selectedIndex = nearest;
    },
    mouseMoveTrigger(event) {
      if (!event.which) this.triggerDragging = false;
      if (this.triggerDragging) {
        this.leftOffset = event.clientX;
      }
    },
    mouseDownTrigger(event) {
      this.triggerDragging = true;
    },
    //切换上一曲
    up(index) {
      let vm = this;
      if (index === 0) {
        this.$Message.success({ title: "提示", content: "已经到顶了喔" });
        return;
      }
      vm.Indexsong = --index;
      vm.playButton = "ios-pause";
      vm.namesong = vm.songList[vm.Indexsong].song;
      let audioplay = this.audio; //播放
      vm.musicUrl = this.path + vm.namesong;
      audioplay.src = vm.musicUrl;
      audioplay.play();
    },
    //切换下一曲
    down(index) {
      let vm = this;
      if (index === vm.songList.length - 1) {
        this.$Message.success({ title: "提示", content: "已经到底了喔" });
        return;
      }
      vm.Indexsong = ++index;
      vm.playButton = "ios-pause";
      vm.namesong = vm.songList[vm.Indexsong].song;
      console.log("Indexsong:" + vm.Indexsong + ",namesong:" + vm.namesong);
      let audioplay = this.audio;
      vm.musicUrl = this.path + vm.namesong;
      audioplay.src = vm.musicUrl;
      audioplay.play(); //播放
    },
    speedChange(e) {
      this.audio.playbackRate = this.playSpeed;
    },
    play(song, index) {
      let vm = this;
      vm.Indexsong = index;
      console.log("Indexsong:" +
        vm.Indexsong + ",song:" + song + ",+playButton:" + vm.playButton);
      if (vm.namesong === song) {
        if (this.audio.paused) {
          let audioplay = this.audio;
          // vm.musicUrl = this.path + vm.namesong
          // audioplay.src = vm.musicUrl;
          audioplay.play(); //播放
        }
        else {
          this.$refs.audio.pause(); //暂停    
        }

        this.refreshPlayButton();
      }
      else if (vm.namesong != song) {
        console.log("song:" + song);
        console.log("playButton:" + vm.playButton);
        vm.playButton = "ios-pause";
        vm.namesong = song;
        let audioplay = this.audio;
        console.log("namesong:" + vm.namesong);
        vm.musicUrl = this.path + vm.namesong;
        audioplay.src = vm.musicUrl;
        audioplay.play(); //播放
      }
    },
    refreshPlayButton() {
      if (this.audio.paused) {
        this.playButton = "ios-play";
      } else {
        this.playButton = "ios-pause";
      }
    },
    handleExport() {
      const stringData = JSON.stringify(this.beatmap, null, 2)
      // dada 表示要转换的字符串数据，type 表示要转换的数据格式
      const blob = new Blob([stringData], {
        type: 'application/json'
      })
      // 根据 blob生成 url链接
      const objectURL = URL.createObjectURL(blob)
      // 创建一个 a 标签Tag
      const aTag = document.createElement('a')
      // 设置文件的下载地址
      aTag.href = objectURL
      // 设置保存后的文件名称
      aTag.download = "beatmap.json"
      // 给 a 标签添加点击事件
      aTag.click()
      // 释放一个之前已经存在的、通过调用 URL.createObjectURL() 创建的 URL 对象。
      // 当你结束使用某个 URL 对象之后，应该通过调用这个方法来让浏览器知道不用在内存中继续保留对这个文件的引用了。
      URL.revokeObjectURL(objectURL)
      this.$Message.info('正在导出，请留意下载管理器');
    },
    handleClear() {
      this.beatmap = {
        title: "",
        composer: "",
        illustrator: "",
        beatmapper: "",
        beatmapUID: "",
        version: "",
        difficulty: 1,
        previewTime: 0,
        songOffset: 0,
        description: "",
        clips: [
          {
            bpm: 100,
            index: 0,
            from: 0,
            to: 0,
            notes: []
          },
        ]
      }
    },
    handleImport() {
      document.getElementById("fileInput").click();

    },
    loadFile(e) {
      let that = this;
      const file = e.target.files[0];
      let formatName = file.name.split(".").splice(-1).toString();
      const reader = new FileReader();
      if (typeof FileReader === "undefined") {
        alert("您的浏览器不支持FileReader接口");
      }
      reader.onload = (e) => {
        const result = e.target.result;
        if (result.startsWith('osu')) {
          that.$Message.success("Loading osu");
          const osu = readOsu(result);
          console.log(osu);
          that.beatmap.title = map.Metadata.Title;


          return;
        }
        // this.$emit("load", (e) => {
        let map = JSON.parse(e.target.result);
        console.log(map);
        if (map.Title) {
          that.$Message.success("Loading milthm");
          that.beatmap.title = map.Title;
          that.beatmap.composer = map.Composer;
          that.beatmap.beatmapper = map.Beatmapper;
          that.beatmap.beatmapUID = map.BeatmapUID;
          that.beatmap.illustrator = map.Illustrator;
          let bpm = map.BPMList[0].BPM;
          that.beatmap.clips = [
            {
              bpm: bpm,
              notes: (() => {
                return map.NoteList.map((item, index, array) => {
                  if (item.From[0] == item.To[0]) {
                    return {
                      start: (item.From[0] / bpm + item.To[1] / item.To[2]),
                      x: (item.Line - 2) * 10
                    }
                  } else {
                    return {
                      type: 2,
                      start: (item.From[0] / bpm + item.To[1] / item.To[2]),
                      x: (item.Line - 2) * 10,
                      length: ((item.To[0] / bpm + item.To[1] / item.To[2]) - (item.From[0] / bpm + item.From[1] / item.From[2]))
                    }
                  }
                });
              })()
            }
          ];
        } else {
          that.beatmap = map;
        }
        // });
      };

      reader.readAsText(file, "utf-8");
    },
    addEffect(type) {
      let effects = this.beatmap.clips[this.editingClipIndex].notes[this.selectedIndex].effects;
      if (effects == undefined) {
        // init effects
        effects = this.beatmap.clips[this.editingClipIndex].notes[this.selectedIndex].effects = [];
      }
      console.log(effects);
      effects.push({
        type: type,
        start: this.getNow(),
        end: this.getNow(),
        startValue: 0,
        endValue: 0,
        curve: 'ease',
      });
    },
    init() {
      let that = this;
      this.audio = this.$refs.audio;
      this.up(1);
      this.refreshPlayButton();
      setInterval(function () {
        //处理中
        this.audio = that.$refs.audio;
        if (that.audio != null) {
          that.currentTime = that.audio.currentTime;
          that.currentTime = that.currentTime;
        }
      }, 10);
      // new Timer(timer => {
      // }, 3000, Infinity);
      const options = {
        zoomview: {
          container: this.$refs.zoomview, //缩略图
        },
        overview: {
          container: this.$refs.overview,
        },
        mediaElement: this.$refs.audio,
        webAudio: {
          audioContext: new AudioContext(),
        },
        emitCueEvents: true,
      };
      Peaks.init(options, (err, peaks) => {
        if (err)
          return;
      });
    },
    IssongListshowhide() {
      let vm = this;
      vm.songListhidden = !vm.songListhidden;
    },
    addClip() {
      this.beatmap.clips.push({
        bpm: 100,
        notes: [],
      });
      this.beatmap.clips = [...this.beatmap.clips];
    },
    clearClip() {
      this.currentClip.notes = [];
    },
    inputInit() {
      let codes = document.querySelectorAll('input')
      codes[0].focus()
      codes.forEach((code, idx) => {
        code.addEventListener('focus', (e) => {
          console.log('f');
          this.inputting = true;
        });
        code.addEventListener('blur', (e) => {
          console.log('b');
          this.inputting = false;
        });
      })
    },
    KeyDown(e) {
      let item = this.currentNote;
      if (item) {
        if (e.key === "e" || e.keyCode === 69) {
          this.effectModal = !this.effectModal;
          this.inputInit();
        }
        if (e.key === "p" || e.keyCode === 80) {
          // 属性窗口
          this.propModal = !this.propModal;
          this.inputInit();
        }
        if (e.key === "r" || e.keyCode === 82) {
          // 如果效果窗口开启
          if (this.effectModal) {
            this.addEffect('rotate');
          }
        }
      }
      if (this.inputting || this.propModal || this.effectModal || this.informationModal) return;
      console.log(e.key, e.keyCode);
      //用过这个方法打印出键盘的key和keyCode
      //然后根据条件进行相应的操作即可
      if (e.key === "Enter" || e.keyCode === 13) {
        console.log("检测到按下了回车键");
      }
      if (e.key === "b" || e.keyCode === 66) {
        let list = this.calBPMList;
        list.push(this.audio.currentTime);
        let sum = 0;
        for (let i in list) {
          if (i == 0) continue;
          sum += list[i] - list[i - 1];
        }
        this.calBPM = 60 / sum * list.length;
      }
      if (e.key === "c" || e.keyCode === 67) {
        this.calBPMList = [];
      }
      
      if (item) {
        if (e.key === "ArrowLeft" || e.keyCode === 37) {
          item.x -= 10;
        }
        if (e.key === "ArrowRight" || e.keyCode === 39) {
          item.x += 10;
        }
        if (e.key === "ArrowUp" || e.keyCode === 38) {
          item.start += Number(this.noteAlign);
        }
        if (e.key === "ArrowDown" || e.keyCode === 40) {
          item.start -= Number(this.noteAlign);
        }
        if (e.key === "Delete" || e.keyCode === 46 || e.key === "x" || e.keyCode === 88) {
          let clip = this.beatmap.clips[this.editingClipIndex];
          clip.notes.splice(this.selectedIndex, 1);
        }
        if (e.keyCode > 48 && e.keyCode <= 52) {
          // 1~4
          item.type = e.keyCode - 48;
          if (item.type == 2) item.length = 0;
        }

        if (e.key === "d" || e.keyCode === 68) {
          let clip = this.beatmap.clips[this.editingClipIndex];
          clip.notes.push(JSON.parse(JSON.stringify(item)));
        }
      }

      if (e.keyCode === 32) {
        if (this.audio.paused) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
        this.refreshPlayButton();
      }
      if (e.key === "z" || e.keyCode === 90) {
        console.log("记录");
        if (this.audio == null)
          return;
        let clip = this.beatmap.clips[this.editingClipIndex];
        clip.notes.push({
          start: this.getNow(),
          x: 0,
          // effects: [],
        });
      }
    },
    getNow() {
      let clip = this.beatmap.clips[this.editingClipIndex];
      let align = Number(this.noteAlign);
      return Math.round(this.audio.currentTime / 60 * clip.bpm / align) * align;
    }
  },
  created() {
    this.handleClear();
    //赋值变量
    this.namesong = this.songList[1].song;
    this.Indexsong = 1;
    this.$nextTick(() => {
      this.init();
    });
  },
  mounted() {
    let that = this;
    window.addEventListener("keydown", this.KeyDown, true);
    this.inputInit();

    let canvas = document.getElementsByTagName('canvas')[0];
    //获取devicePixelRatio

    var dpr = window.devicePixelRatio || 1;
    window.onresize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    window.onresize();
    if (canvas == null) return;
    let ctx = canvas.getContext('2d');
    if (ctx == null) return;
    //注意如下代码
    setInterval(function () {
      if (that.currentClip == undefined) return;
      let now = that.currentTime * that.currentClip.bpm / 60;

      let w = canvas.width;
      let h = canvas.height;
      ctx.fillStyle = "#000";
      ctx.lineWidth = 2;

      ctx.fillRect(0, 0, w, h);
      let blockHeight = 64;
      let cellWidth = w / 16;

      for (let y = Math.ceil(now) - 10; y < Math.ceil(now) + 10; y += 1) {
        ctx.strokeStyle = "#ffffff22";
        ctx.strokeRect(0, h / 2 - (y - now + 0.5) * blockHeight, w, blockHeight);
      }
      for (let x = 0; x < 10; x++) {
        ctx.strokeStyle = "#ffff0022";
        ctx.strokeRect(x * w / 10, 0, w / 10, h);
      }
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, h / 2, w, 1);

      ctx.strokeStyle = "#fff";
      ctx.strokeRect(window.clientX - 8, window.clientY - 8, 16, 16);

      // let nearest = 0;
      // let distance = 10000;

      that.beatmap.clips.forEach(clip => {

        now = that.currentTime * clip.bpm / 60;
        let view = clip.bpm * 8;
        let notes = (view == 0) ? clip.notes : clip.notes.filter(item => {
          // if (distance >= Math.abs(item.start - now)) {
          //   nearest = index;
          //   distance = Math.abs(item.start - now);
          // }
          return item.start > now - view && item.start < now + view;
        });

        // if (now != window.lastNow) {
        //   that.selectedIndex = nearest;
        // }

        notes.forEach(note => {
          let ceilHeight = 16;
          let holdHeight = (note.type == 2) ? note.length * blockHeight : 0;
          let x = w / 2 + note.x / 100 * w;
          let y = h / 2 - (note.start - now + 0.1) * blockHeight;

          ctx.save();
          // 位移
          ctx.translate(x, y);

          // 变换效果
          if (note.effects) if (note.effects.length != 0) note.effects.forEach(effect => {
            let _value = 0;
            if (effect.start < now && effect.end > now) {
              _value = ((now - effect.start) / (effect.end - effect.start))
              if (effect.curve) _value = Curves[effect.curve].transform(_value);
            } else if (effect.end > now) {
              _value = 0;
            } else if (effect.start < now) {
              _value = 1;
            }
            _value = ((effect.endValue - effect.startValue) * _value + effect.startValue);
            switch (effect.type) {
                case 'rotate':
                  const angle = _value / 180 * Math.PI;
                  ctx.rotate(angle);
                  break;
                case 'moveX':
                  const transX = _value / 100 * w;
                  ctx.translate(transX, 0);
                  break;
                case 'moveY':
                  ctx.translate(0, _value);
                  break;
              }
          });

          if (clip == that.currentClip) {
            let type = note.type;
            if (type == undefined) type = 0;
            ctx.fillStyle = ["#0000ff88", "#0000ff88", "#0000ff88", "#fdf5d088", "#ea7b9988"][type];
          }
          else
            ctx.fillStyle = "#11111188";


          ctx.fillRect(-cellWidth / 2, -ceilHeight / 2 - holdHeight, cellWidth, ceilHeight + holdHeight);
          if (clip == that.currentClip && clip.notes.indexOf(note) == that.selectedIndex)
            ctx.strokeStyle = "#00ff00";
          else
            ctx.strokeStyle = "#fff";

          ctx.strokeRect(-cellWidth / 2, -ceilHeight / 2 - holdHeight, cellWidth, ceilHeight + holdHeight);

          // if (item.effects) if(item.effects.length != 0) item.effects.forEach(effect =>{
          //   switch (effect.type) {
          //     case 'rotate':
          //       if (effect.start < now && effect.end > now) {
          //         const angle = ((effect.endValue - effect.startValue) * ((now - effect.start) / (effect.end - effect.start)) + effect.startValue)/ 180 * Math.PI;
          //         ctx.rotate(-angle);
          //       }
          //       break;
          //   }
          // });

          // ctx.translate(-x, holdHeight - y);
          ctx.restore();
        });
      });

      window.lastNow = now;
    }, 10)

  },
}
</script>