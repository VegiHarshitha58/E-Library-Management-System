const theme = localStorage.getItem("theme");

if(theme === "light"){

    document.documentElement.style.setProperty("--bg","#ffffff");
    document.documentElement.style.setProperty("--surface","#f5f5f5");
    document.documentElement.style.setProperty("--surface2","#e8e8e8");
    document.documentElement.style.setProperty("--text","#111111");
    document.documentElement.style.setProperty("--border","#cccccc");

}else{

    document.documentElement.style.setProperty("--bg","#0d0d0d");
    document.documentElement.style.setProperty("--surface","#111111");
    document.documentElement.style.setProperty("--surface2","#1f1f1f");
    document.documentElement.style.setProperty("--text","#ffffff");
    document.documentElement.style.setProperty("--border","#333333");

}