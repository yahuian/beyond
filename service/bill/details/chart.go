package details

import (
	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
)

type basicParam struct {
	Kind      []string `form:"kind" json:"kind" validate:"dive,oneof=income pay"`
	CreatedAt []string `form:"created_at[]" json:"created_at" validate:"omitempty,len=2,dive,datetime=2006-01-02"`
	Ledger    []string `form:"ledger[]" json:"ledger"`
}

type base struct {
	Key   string  `json:"key"`
	Value float64 `json:"value"`
}

// @Summary 饼图
// @Tags    bill
// @Accept  json
// @Produce json
// @Param   field        query    string false "which field to aggregate" Enums(name, type)
// @Param   kind         query    string false "kind"                     Enums(income, pay)
// @Param   created_at[] query    string false "created_at"
// @Param   ledger[]     query    string false "ledger"
// @Success 200          {object} ctx.Response{data=[]base}
// @Router  /bill/details/chart/pie [get]
func Pie(c *ctx.Context) {
	var param basicParam
	query, args, err := c.BuildQuery(&param)
	if err != nil {
		c.BadRequest(err)
		return
	}
	var selectVal string
	field := c.Query("field")
	if field == "name" {
		selectVal = "COUNT(name) as value, name as key"
	} else if field == "type" {
		selectVal = "SUM(money) as value, type as key"
	} else {
		c.BadRequest(errorx.New("field param must be name/type"))
		return
	}

	var res []base
	err = db.Client().Select(selectVal).Model(db.BillDetails{}).
		Where(query, args...).Group(field).Order("value desc").Scan(&res).Error
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	if field == "type" {
		for i := range res {
			if res[i].Key == "" {
				res[i].Key = "未分类"
			}
		}
	}

	c.SuccessWith(ctx.Response{
		Msg:  "success",
		Data: res,
	})
}
