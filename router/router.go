package router

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/yahuian/beyond/config"
	"github.com/yahuian/beyond/service/bill"
	"github.com/yahuian/beyond/service/travel"
	"github.com/yahuian/gox/errorx"

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
	pages := []string{"bill", "travel", "news", "system"}
	for _, v := range pages {
		r.GET(v, func(c *gin.Context) {
			c.HTML(http.StatusOK, "index.html", nil)
		})
	}

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")

	routers := []func(*gin.RouterGroup){
		bill.Router,
		travel.Router,
	}
	for _, f := range routers {
		f(api)
	}

	if config.Val.Server.Mode == config.ReleaseMode {
		gin.SetMode(gin.ReleaseMode)
	}

	if err := r.Run(config.Val.Server.Address); err != nil {
		return errorx.Wrap(err)
	}

	return nil
}
