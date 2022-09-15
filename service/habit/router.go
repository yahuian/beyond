package habit

import (
	"github.com/gin-gonic/gin"
	"github.com/yahuian/beyond/ctx"
)

func Router(e *gin.RouterGroup) {
	h := e.Group("/habit")
	{
		h.POST("", ctx.Handle(Create))
		h.GET("", ctx.Handle(List))
		h.PUT("", ctx.Handle(Update))
		h.DELETE("", ctx.Handle(Delete))
	}
}
