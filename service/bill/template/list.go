package template

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type listParam struct {
	ID        []uint   `form:"id[]" json:"id"`
	Kind      []string `form:"kind[]" json:"kind" validate:"dive,oneof=type ledger"`
	CreatedAt []string `form:"created_at[]" json:"created_at" validate:"omitempty,len=2,dive,datetime=2006-01-02 15:04:05"`
}

// @Summary 模板列表
// @Tags    bill
// @Accept  json
// @Produce json
// @Param   page         query    int    false "page"
// @Param   size         query    int    false "size"
// @Param   id[]         query    uint   false "id"
// @Param   created_at[] query    string false "created_at"
// @Success 200          {object} ctx.Response{data=[]db.BillTemplate}
// @Router  /bill/template [get]
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

	list, err := db.GetMany[db.BillTemplate](paging.Page, paging.Size, query, args...)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	count, err := db.Count[db.BillTemplate](query, args...)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: list, Count: count})
}
