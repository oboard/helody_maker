<template>
  <div class="flex flex-row h-full">
    <div class="flex-1">
      <canvas class="h-full w-full" @mouseup="onMouseUp" />
    </div>
    <div class="flex-1 select-none h-full">
      <div class="flex flex-col h-full">
        <div class="flex flex-row">
          <div class="flex flex-col flex-1">
            <Card class="flex-1" style="width:100%">
              <template #title>
                <Icon type="ios-musical-notes"></Icon>
                音乐控制器 {{ namesong }}
              </template>
              现在播放位置：{{ currentTime * formItem.clips[editingClipIndex].bpm }}
              <audio class="" ref="audio" controls="controls" :preload="preload">
                <source />
              </audio>

              <div class="flex justify-center">
                <ButtonGroup shape="circle">
                  <Button type="info" title="上一首" size="large" @click="up(Indexsong)">
                    <Icon type="ios-arrow-back" />
                  </Button>
                  <Button type="info" title="播放/暂停" size="large" @click="play(namesong, Indexsong)">
                    <Icon :type="playButton" />
                  </Button>
                  <Button type="info" title="下一首" size="large" @click="down(Indexsong)">
                    <Icon type="ios-arrow-forward" />
                  </Button>
                  <Button type="info" title="列表" size="large" @click="IssongListshowhide">
                    <Icon type="ios-list" />
                  </Button>
                </ButtonGroup>
              </div>
              <Table :columns="columns" :data="songList" v-show="songListhidden" @click="IssongListshowhide"></Table>
            </Card>
            <Card class="flex-1" style="width:100%">
              <template #title>
                <Icon type="ios-musical-notes"></Icon>
                片段控制器
              </template>
              <div class="flex justify-center">
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
              </div>
              <Form :model="clipControllerData" :label-width="80">
                <FormItem label="片段">
                  <Slider v-model="editingClipIndex" :min="1" :max="formItem.clips.length" show-input step></Slider>
                </FormItem>
                <FormItem label="BPM">
                  <Slider v-model="formItem.clips[editingClipIndex].bpm" :min="1" :max="300" show-input></Slider>
                </FormItem>
              </Form>

            </Card>
          </div>
          <Card class="flex-1" style="width:100%">
            <template #title>
              <Icon type="ios-musical-notes"></Icon>
              参数设置
            </template>
            <Form :model="formItem" :label-width="80">
              <FormItem label="歌名">
                <Input v-model="formItem.name" placeholder="Enter something..."></Input>
              </FormItem>
              <!-- <FormItem label="Select">
            <Select v-model="formItem.select">
              <Option value="beijing">New York</Option>
              <Option value="shanghai">London</Option>
              <Option value="shenzhen">Sydney</Option>
            </Select>
          </FormItem> -->
              <FormItem label="创作日期">
                <!-- <Row> -->
                <!-- <Col span="11"> -->
                <DatePicker type="date" placeholder="选择日期" v-model="formItem.createDate"></DatePicker>
                <!-- </Col> -->
                <!-- <Col span="2" style="text-align: center">-</Col>
              <Col span="11">
              <TimePicker type="time" placeholder="选择时间" v-model="formItem.time"></TimePicker> -->
                <!-- </Col> -->
                <!-- </Row> -->
              </FormItem>
              <!-- <FormItem label="Radio">
            <RadioGroup v-model="formItem.radio">
              <Radio label="male">Male</Radio>
              <Radio label="female">Female</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="Checkbox">
            <CheckboxGroup v-model="formItem.checkbox">
              <Checkbox label="Eat"></Checkbox>
              <Checkbox label="Sleep"></Checkbox>
              <Checkbox label="Run"></Checkbox>
              <Checkbox label="Movie"></Checkbox>
            </CheckboxGroup>
          </FormItem> -->
              <!-- <FormItem label="Switch">
            <i-switch v-model="formItem.switch" size="large">
              <template #open>
                <span>On</span>
              </template>
              <template #close>
                <span>Off</span>
              </template>
            </i-switch>
          </FormItem> -->
              <FormItem label="难度等级">
                <Slider v-model="formItem.difficulty" :min="1" :max="20" show-input></Slider>
              </FormItem>
              <FormItem label="歌手">
                <Input v-model="formItem.artist" placeholder="Enter something..."></Input>
              </FormItem>
              <FormItem label="谱师">
                <Input v-model="formItem.creator" placeholder="Enter something..."></Input>
              </FormItem>
              <FormItem label="简介">
                <Input v-model="formItem.description" type="textarea" :autosize="{ minRows: 2, maxRows: 5 }"
                  placeholder="Enter something..."></Input>
              </FormItem>
              <FormItem>
                <Button type="primary" @click="handleSubmit">导出</Button>
                <!-- <Button style="margin-left: 8px">Cancel</Button> -->
              </FormItem>
            </Form>
          </Card>
        </div>
        <div class="overflow-x-scroll p-4">
          <span>空格：播放▶️/暂停⏸️｜z/x:打点｜b:计算BPM<span class="text-blue-500">[{{ calBPM }}]</span>
            ｜c:清空BPM计算列表｜⬅️➡️:x位移｜⬆️⬇️:时移｜</span>

        </div>
        <Card class="" style="width:100%">
          <template #title>
            <Icon type="ios-infinite" />
            波形显示器
          </template>
          <div id="zoomview-container" class="h-16" ref="zoomview"></div>
          <div id="overview-container" class="h-16" ref="overview"></div>
        </Card>
        <span class="flex-1">
          {{ JSON.stringify(formItem) }}
        </span>
      </div>
    </div>
  </div>
  <Modal v-model="effectModal" draggable sticky scrollable :mask="false" title="添加特效">
    <div v-if="formItem.clips[editingClipIndex].data.length > 0 && formItem.clips[editingClipIndex].data[selectedIndex]"
      class="overflow-y-scroll divide-y-2 divide-slate-400 divide-dashed">
      <div v-for="item in formItem.clips[editingClipIndex].data[selectedIndex].effects">
        <Form>
          <FormItem label="类型">
            <Input @focus="focusInput" @blur="blurInput" v-model="item.type" placeholder="type"></Input>
          </FormItem>
          <FormItem label="参数">
            <Input @focus="focusInput" @blur="blurInput" v-model="item.value" placeholder="value"></Input>
          </FormItem>
        </Form>
      </div>
    </div>
    <Button @click="addEffect">添加</Button>
  </Modal>
</template>
  
<script>
import Peaks from 'peaks.js';

export default {
  data() {
    return {
      audio: {},
      leftOffset: 300,
      triggerDragging: false,
      selectedIndex: 0,
      currentClip: {},
      currentTime: 0,
      inputing: false,
      formItem: {
        name: "",
        artist: "",
        artistUnicode: "",
        creator: "",
        createDate: "",
        version: "",
        difficulty: 1,
        description: "",
        clips: [
          {
            bpm: 100,
            index: 0,
            from: 0,
            to: 0,
            data: []
          },
        ]
      },
      calBPM: 100,
      calBPMList: [0,],
      editingClipIndex: 0,
      optiontype: ["up", "play", "down"],
      preload: "auto",
      Indexsong: 0,
      namesong: "",
      effectModal: false,
      playButton: "ios-play",
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
  methods: {
    onMouseUp(event) {
      let that = this;
      if (that.currentClip == undefined) return;
      let canvas = document.getElementsByTagName('canvas')[0];
      let w = canvas.width;
      let h = canvas.height;
      var dpr = window.devicePixelRatio || 1;
      let now = that.currentTime * that.currentClip.bpm / 60;
      let view = that.currentClip.bpm * 4;
      let blockHeight = 64;
      let ceilHeight = 16;
      // console.log(Math.floor(event.clientX*dpr/w*10));
      window.clientX = event.clientX * dpr;
      window.clientY = event.clientY * dpr;

      let nearest = 0;
      let distance = 10000000000000000;
      let elements = that.currentClip.data.filter(function (item, index, array) {
        return item.start > now - view && item.start < now + view;
      });

      for (let index in elements) {
        const item = elements[index];
        let d = Math.pow(w / 2 - 64 + item.x / 100 * w - window.clientX, 2) + Math.pow(h / 2 - (item.start - now + 0.1) * blockHeight - window.clientY, 2);
        if (distance >= d) {
          nearest = that.currentClip.data.indexOf(item);
          distance = d;
        }
        // ctx.fillStyle = "#0000ff88";
        // ctx.fillRect(w / 2 - 64 + item.x/100*w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
        // if (index == that.selectedIndex)
        //     ctx.strokeStyle = "#00ff00";
        // else
        //     ctx.strokeStyle = "#fff";

        // ctx.strokeRect(w / 2 - 64 + item.x/100*w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
      }
      console.log(nearest);
      that.selectedIndex = nearest;
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
      console.log("Indexsong:" + vm.Indexsong + ",namesong:" + vm.namesong);
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
    handleSubmit(name) {
      console.log(Date.parse(this.formItem.createDate).toString());
      // this.$refs[name].validate((valid) => {
      //   if (valid) {
      //     this.$Message.success('Success!');
      //   } else {
      //     this.$Message.error('Fail!');
      //   }
      // });
    },
    addEffect() {
      let effects = this.formItem.clips[this.editingClipIndex].data[this.selectedIndex].effects;
      console.log(effects);
      effects.push({
        type: 'fade',
        value: '1.0'
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
          that.currentClip = that.formItem.clips[that.editingClipIndex];
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
    clearClip() {
      this.currentClip.data = [];
    },
    focusInput(e) {
      this.inputing = true;
    },
    blurInput(e) {
      this.inputing = false;
    },
    attachInputtingEvent(code) {
      code.addEventListener('focus',this.focusInput)
      code.addEventListener('blur', this.blurInput);
    },
    KeyDown(e) {
      if(this.inputing) return;
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
      if (e.key === "e" || e.keyCode === 69) {
        this.effectModal = !this.effectModal;
      }
      if (e.key === "ArrowLeft" || e.keyCode === 37) {
        that.currentClip.data[that.selectedIndex].x -= 10;
      }
      if (e.key === "ArrowRight" || e.keyCode === 39) {
        that.currentClip.data[that.selectedIndex].x += 10;
      }
      if (e.key === "Backspace" || e.keyCode === 8) {
        let clip = this.formItem.clips[this.editingClipIndex];
        clip.data.splice(this.selectedIndex, 1);
      }
      if (e.keyCode === 32) {
        if (this.audio.paused) {
          this.audio.play();
        } else {
          this.audio.pause();
        }
        this.refreshPlayButton();
      }
      if (e.key === "z" || e.keyCode === 90 || e.key === "x" || e.keyCode === 88) {
        console.log("记录");
        if (this.audio == null)
          return;
        let clip = this.formItem.clips[this.editingClipIndex];
        clip.data.push({
          start: Math.round(this.audio.currentTime / 60 * clip.bpm),
          x: 0,
          effects: [],
        });
      }
    }
  },
  created() {
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

    let codes = document.querySelectorAll('input')
    codes[0].focus()
    codes.forEach((code,idx) => {
       that.attachInputtingEvent(code);
    })


    let canvas = document.getElementsByTagName('canvas')[0];
    //获取devicePixelRatio
    var dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    if (canvas == null) return;
    let ctx = canvas.getContext('2d');
    if (ctx == null) return;
    //注意如下代码
    setInterval(function () {
      if (that.currentClip == undefined) return;
      let now = that.currentTime * that.currentClip.bpm / 60;
      let view = that.currentClip.bpm * 4;

      let w = canvas.width;
      let h = canvas.height;
      ctx.fillStyle = "#000";
      ctx.lineWidth = 2;

      ctx.fillRect(0, 0, w, h);
      let blockHeight = 64;
      let ceilHeight = 16;

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

      let nearest = 0;
      let distance = 10000;

      let elements = that.currentClip.data.filter(function (item, index, array) {
        if (distance >= Math.abs(item.start - now)) {
          nearest = index;
          distance = Math.abs(item.start - now);
        }
        return item.start > now - view && item.start < now + view;
      });
      if (now != window.lastNow) {
        that.selectedIndex = nearest;
      }

      for (let index in elements) {
        const item = elements[index];
        ctx.fillStyle = "#0000ff88";
        ctx.fillRect(w / 2 - 64 + item.x / 100 * w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
        if (that.currentClip.data.indexOf(item) == that.selectedIndex)
          ctx.strokeStyle = "#00ff00";
        else
          ctx.strokeStyle = "#fff";

        ctx.strokeRect(w / 2 - 64 + item.x / 100 * w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
      }

      window.lastNow = now;
    }, 10)

  },
}
</script>