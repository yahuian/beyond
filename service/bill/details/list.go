package details

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type listParam struct {
	ID        []uint   `form:"id[]" json:"id"`
	Kind      []string `form:"kind[]" json:"kind" validate:"dive,oneof=income pay"`
	Type      []string `form:"type[]" json:"type"`
	Ledger    []string `form:"ledger[]" json:"ledger"`
	CreatedAt []string `form:"created_at[]" json:"created_at" validate:"omitempty,len=2,dive,datetime=2006-01-02"`
}

// @Summary 查询明细
// @Tags    bill
// @Accept  json
// @Produce json
// @Param   page         query    int    false "page"
// @Param   size         query    int    false "size"
// @Param   id[]         query    uint   false "id"
// @Param   kind[]       query    string false "kind"
// @Param   type[]       query    string false "type"
// @Param   ledger[]     query    string false "ledger"
// @Param   created_at[] query    string false "created_at"
// @Success 200          {object} ctx.Response{data=[]db.BillDetails}
// @Router  /bill/details [get]
func List(c *ctx.Context) {
	paging, err := c.Paging()
	if err != nil {
		c.BadRequest(err)
		return
	}
	query, args, err := c.Query(&listParam{})
	if err != nil {
		c.BadRequest(err)
		return
	}

	list, err := db.GetMany[db.BillDetails](paging.Page, paging.Size, query, args...)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	count, err := db.Count[db.BillDetails](query, args...)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: list, Count: count})
}
