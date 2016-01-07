##山寨[Astral](https://app.astralapp.com/)
###前端
前端核心的app.js直接用了原网站的，没有改动，css和html写得挺乱……不过基本界面还是写好了……

###后端
这个项目是可以前后端分离的，但是懒得开两个工程以及配置nginx就写到一块了……（反正只是我在写），其中RouteController等价nginx的功能，返回SPA的核心文件，其他的几个Controller就只是提供api，然后配置文件github.properties是我的一个github应用信息，可以自行修改

###启动
配置端口号为8080，启动tomcat即可

###总结
这个项目有一点点特别，因为整个过程没有改动app.js，通过api的格式写了后端，算是一个简单的SPA练手项目吧，不完善的地方有很多，譬如没有标签功能，markdown渲染难看，不支持搜索等（总之如果有人肯给我pull request就好了QAQ