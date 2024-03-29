package travel

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

// @Summary 删除标记
// @Tags    旅行足迹
// @Accept  json
// @Produce json
// @param   payload body     ctx.IDList true "request payload"
// @Success 200     {object} ctx.Response
// @Router  /travel [delete]
func Delete(c *ctx.Context) {
	param, err := c.GetIDList()
	if err != nil {
		c.BadRequest(err)
		return
	}

	if err := db.NewTravelDao().Delete("id IN ?", param.IDS); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	//

	c.Success()
}
