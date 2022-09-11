package plan

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

// @Summary 删除计划
// @Tags    番茄任务
// @Accept  json
// @Produce json
// @param   payload body     ctx.IDList true "request payload"
// @Success 200     {object} ctx.Response
// @Router  /tomato/plan [delete]
func Delete(c *ctx.Context) {
	param, err := c.GetIDList()
	if err != nil {
		c.BadRequest(err)
		return
	}

	if err := db.NewTomatoPlanDao().Delete("id IN ?", param.IDS); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.Success()
}
