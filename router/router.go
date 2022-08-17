package router

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/pkg/browser"
	"github.com/yahuian/beyond/config"
	"github.com/yahuian/beyond/service/bill"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func Init() error {
	r := gin.Default()

	// TODO change param
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 注册前端页面
	r.Use(static.Serve("/", static.LocalFile("./dist", false)))
	r.LoadHTMLFiles("./dist/index.html")
	pages := []string{"bill", "news", "system"}
	for _, v := range pages {
		r.GET(v, func(c *gin.Context) {
			c.HTML(http.StatusOK, "index.html", nil)
		})
	}

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")

	routers := []func(*gin.RouterGroup){
		bill.Router,
	}
	for _, f := range routers {
		f(api)
	}

	addr := config.Val.Server.Address

	if config.Val.Setting.AutoOpenBrowser {
		if err := browser.OpenURL("http://" + addr); err != nil {
			logx.Warn(err)
		}
	}

	if err := r.Run(addr); err != nil {
		return errorx.Wrap(err)
	}

	return nil
}
