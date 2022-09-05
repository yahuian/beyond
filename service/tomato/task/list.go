package task

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type listParam struct {
	ID        []uint   `form:"id[]" json:"id"`
	CreatedAt []string `form:"created_at[]" json:"created_at" validate:"omitempty,len=2,dive,datetime=2006-01-02 15:04:05"`
}

// @Summary 任务列表
// @Tags    番茄任务
// @Accept  json
// @Produce json
// @Param   id[]         query    uint   false "id"
// @Param   created_at[] query    string false "created_at"
// @Success 200          {object} ctx.Response{data=[]db.TomatoTask}
// @Router  /tomato/task [get]
func List(c *ctx.Context) {
	query, args, err := c.BuildQuery(&listParam{})
	if err != nil {
		c.BadRequest(err)
		return
	}

	count, err := db.Count[db.TomatoTask](query, args...)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	if count == 0 {
		c.SuccessWith(ctx.Response{Msg: "success", Count: 0})
		return
	}

	opt := db.Option{
		Page:  1,
		Size:  int(count),
		Query: query,
		Args:  args,
		Order: "id asc",
	}

	list, err := db.GetMany[db.TomatoTask](opt)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: list, Count: count})
}
