package file

import (
	"github.com/gin-gonic/gin"
	"github.com/yahuian/beyond/ctx"
)

func Router(e *gin.RouterGroup) {
	r := e.Group("/file")

	r.POST("/upload", ctx.Handle(Upload))
	r.GET("/read", ctx.Handle(Read))
	r.DELETE("/delete", ctx.Handle(Delete))
}
