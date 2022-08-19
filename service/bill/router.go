package bill

import (
	"github.com/gin-gonic/gin"
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/service/bill/details"
	"github.com/yahuian/beyond/service/bill/ledger"
	Type "github.com/yahuian/beyond/service/bill/type"
)

func Router(e *gin.RouterGroup) {
	r := e.Group("/bill")

	Details := r.Group("/details")
	{
		Details.POST("", ctx.Handle(details.Create))
		Details.GET("", ctx.Handle(details.List))
		Details.DELETE("", ctx.Handle(details.Delete))
		Details.PUT("", ctx.Handle(details.Update))
		Chart := Details.Group("/chart")
		{
			Chart.GET("/pie", ctx.Handle(details.Pie))
			Chart.GET("/line", ctx.Handle(details.Line))
		}
	}

	TypeR := r.Group("/type")
	{
		TypeR.POST("", ctx.Handle(Type.Create))
		TypeR.GET("", ctx.Handle(Type.List))
		TypeR.DELETE("", ctx.Handle(Type.Delete))
		TypeR.PUT("", ctx.Handle(Type.Update))
	}

	Ledger := r.Group("/ledger")
	{
		Ledger.POST("", ctx.Handle(ledger.Create))
		Ledger.GET("", ctx.Handle(ledger.List))
		Ledger.DELETE("", ctx.Handle(ledger.Delete))
		Ledger.PUT("", ctx.Handle(ledger.Update))
	}
}
