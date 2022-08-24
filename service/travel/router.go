package travel

import (
	"github.com/gin-gonic/gin"
	"github.com/yahuian/beyond/ctx"
)

func Router(e *gin.RouterGroup) {
	r := e.Group("/travel")

	r.POST("", ctx.Handle(Create))
	r.GET("", ctx.Handle(List))
	r.GET("/all", ctx.Handle(AllList))
	r.DELETE("", ctx.Handle(Delete))
	r.PUT("", ctx.Handle(Update))
}
