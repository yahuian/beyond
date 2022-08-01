package bill

import (
	"github.com/gin-gonic/gin"
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/service/bill/details"
)

func Router(e *gin.RouterGroup) {
	r := e.Group("/bill")

	Details := r.Group("/details")
	{
		Details.POST("", ctx.Handle(details.Create))
		Details.GET("", ctx.Handle(details.List))
		Details.DELETE("", ctx.Handle(details.Delete))
		Chart := Details.Group("/chart")
		{
			Chart.GET("/pie", ctx.Handle(details.Pie))
			Chart.GET("/line", ctx.Handle(details.Line))
		}
	}
}
