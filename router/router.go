package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/yahuian/beyond/config"
	"github.com/yahuian/beyond/service/bill"
	"github.com/yahuian/gox/errorx"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "github.com/yahuian/beyond/docs"
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

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := r.Group("/api")

	routers := []func(*gin.RouterGroup){
		bill.Router,
	}
	for _, f := range routers {
		f(api)
	}

	if err := r.Run(config.Val.Server.Address); err != nil {
		return errorx.Wrap(err)
	}

	return nil
}
