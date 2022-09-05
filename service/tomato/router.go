package tomato

import (
	"github.com/gin-gonic/gin"
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/service/tomato/task"
)

func Router(e *gin.RouterGroup) {
	r := e.Group("/tomato")

	t := r.Group("/task")
	{
		t.POST("", ctx.Handle(task.Create))
		t.GET("", ctx.Handle(task.List))
		t.PUT("", ctx.Handle(task.Update))
		t.DELETE("", ctx.Handle(task.Delete))
	}
}
