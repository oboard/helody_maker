<template>
    <canvas class="h-full w-full" @mouseup="onMouseUp" />
</template>
<script>

export default {
    methods: {
        onMouseUp(event) {
            let canvas = document.getElementsByTagName('canvas')[0];
            let w = canvas.width;
            let h = canvas.height;
            var dpr = window.devicePixelRatio || 1;
            let now = window.currentTime * window.currentClip.bpm / 60;
            let view = window.currentClip.bpm * 4;
            let blockHeight = 64;
            let ceilHeight = 16;
            // console.log(Math.floor(event.clientX*dpr/w*10));
            window.clientX = event.clientX * dpr;
            window.clientY = event.clientY * dpr;

            let nearest = 0;
            let distance = 10000000000000000;
            let elements = window.currentClip.data.filter(function (item, index, array) {
                // if(distance >= Math.abs(item.start - now)) {
                //     nearest = index;
                //     distance = Math.abs(item.start - now);
                // }
                return item.start > now - view && item.start < now + view;
            });
            // if(now != window.lastNow) {
            //     window.selectedIndex = nearest;
            // }

            for (let index in elements) {
                const item = elements[index];
                let d = Math.pow(w / 2 - 64 + item.x/100*w - window.clientX, 2) + Math.pow(h / 2 - (item.start - now + 0.1) * blockHeight - window.clientY, 2);
                if(distance >= d) {
                    nearest = index;
                    distance = d;
                }
                // ctx.fillStyle = "#0000ff88";
                // ctx.fillRect(w / 2 - 64 + item.x/100*w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
                // if (index == window.selectedIndex)
                //     ctx.strokeStyle = "#00ff00";
                // else
                //     ctx.strokeStyle = "#fff";

                // ctx.strokeRect(w / 2 - 64 + item.x/100*w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
            }
            window.selectedIndex = nearest;
        }
    },
    mounted() {
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
            if (window.currentClip == undefined) return;
            let now = window.currentTime * window.currentClip.bpm / 60;
            let view = window.currentClip.bpm * 4;

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
            ctx.strokeRect(window.clientX-8, window.clientY-8, 16, 16);
            console.log(window.clientX);

            let nearest = 0;
            let distance = 10000;

            let elements = window.currentClip.data.filter(function (item, index, array) {
                if(distance >= Math.abs(item.start - now)) {
                    nearest = index;
                    distance = Math.abs(item.start - now);
                }
                return item.start > now - view && item.start < now + view;
            });
            if(now != window.lastNow) {
                window.selectedIndex = nearest;
            }

            for (let index in elements) {
                const item = elements[index];
                ctx.fillStyle = "#0000ff88";
                ctx.fillRect(w / 2 - 64 + item.x/100*w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
                if (index == window.selectedIndex)
                    ctx.strokeStyle = "#00ff00";
                else
                    ctx.strokeStyle = "#fff";

                ctx.strokeRect(w / 2 - 64 + item.x/100*w, h / 2 - (item.start - now + 0.1) * blockHeight, 128, ceilHeight);
            }

            window.lastNow  = now;
        }, 10)

    }
}
</script>