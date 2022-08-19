package ledger

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

// @Summary 删除账本
// @Tags    bill
// @Accept  json
// @Produce json
// @param   payload body     ctx.IDList true "request payload"
// @Success 200     {object} ctx.Response
// @Router  /bill/ledger [delete]
func Delete(c *ctx.Context) {
	param, err := c.GetIDList()
	if err != nil {
		c.BadRequest(err)
		return
	}

	if err := db.DeleteByID[db.BillLedger](param.IDS...); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.Success()
}
