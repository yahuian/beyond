package ledger

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type listParam struct {
	ID        []uint   `form:"id[]" json:"id"`
	CreatedAt []string `form:"created_at[]" json:"created_at" validate:"omitempty,len=2,dive,datetime=2006-01-02 15:04:05"`
}

// @Summary 账本列表
// @Tags    每日记账
// @Accept  json
// @Produce json
// @Param   page         query    int    false "page"
// @Param   size         query    int    false "size"
// @Param   id[]         query    uint   false "id"
// @Param   created_at[] query    string false "created_at"
// @Success 200          {object} ctx.Response{data=[]db.BillLedger}
// @Router  /bill/ledger [get]
func List(c *ctx.Context) {
	paging, err := c.Paging()
	if err != nil {
		c.BadRequest(err)
		return
	}
	query, args, err := c.BuildQuery(&listParam{})
	if err != nil {
		c.BadRequest(err)
		return
	}

	opt := db.Option{
		Page:  paging.Page,
		Size:  paging.Size,
		Query: query,
		Args:  args,
		Order: "times desc",
	}

	list, err := db.GetMany[db.BillLedger](opt)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	count, err := db.Count[db.BillLedger](query, args...)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: list, Count: count})
}
