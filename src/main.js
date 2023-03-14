import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import ViewUIPlus from 'view-ui-plus'
import { createPinia } from 'pinia'
import 'view-ui-plus/dist/styles/viewuiplus.css'

createApp(App).use(ViewUIPlus).use(createPinia()).mount('#app')
