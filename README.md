# 偷吃行动 · V0.1

桌面浏览器第一人称教室原型。当前版本包含身份选择、卡通几何教室、第一人称移动与碰撞；偷吃、检查、计分、巡逻和联机暂不包含。

## 启动

```bash
npm install
npm run dev
```

使用支持 WebGL 的桌面浏览器打开 Vite 输出的本地地址。点击身份卡即可进入，点击画面锁定鼠标；按 Esc 暂停，选择继续或返回身份选择。

## 主要文件

- `src/main.ts`：身份选择、页面状态与游戏入口。
- `src/roles.ts`：身份出生点、朝向、显示名称和专属第一人称道具配置。
- `src/classroom.ts`：教室几何体、家具、装饰人物与碰撞边界。
- `src/controls.ts`：WASD、鼠标视角、Pointer Lock、Esc 暂停和碰撞移动。
- `src/style.css`：菜单、HUD 与暂停界面样式。
