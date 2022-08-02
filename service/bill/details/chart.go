package details

import (
	"fmt"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
	"github.com/yahuian/gox/slicex"
)

type pieParam struct {
	Kind      []string `form:"kind" json:"kind" validate:"dive,oneof=income pay"`
	CreatedAt []string `form:"created_at[]" json:"created_at" validate:"omitempty,len=2,dive,datetime=2006-01-02 15:04:05"`
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
// @Success 200  {object} ctx.Response{data=[]base}
// @Router  /bill/details/chart/pie [get]
func Pie(c *ctx.Context) {
	var param pieParam
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

	res := make([]base, 0) // fix ui chart error when response data is null
	err = db.Client().Select(selectVal).Model(db.BillDetails{}).
		Where(query, args...).Group(field).Order("value desc").Scan(&res).Error
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	if field == "type" {
		slicex.Map(res, func(i int, v base) base {
			if v.Key == "" {
				res[i].Key = "未分类"
			}
			return v
		})
	}

	c.SuccessWith(ctx.Response{
		Msg:  "success",
		Data: res,
	})
}

type lineParam struct {
	Kind []string `form:"kind" json:"kind" validate:"dive,oneof=income pay"`
}

// @Summary 折线图
// @Tags    bill
// @Accept  json
// @Produce json
// @Param   date query    string true  "date" Enums(week,month,year)
// @Param   kind query    string false "kind" Enums(income, pay)
// @Success 200          {object} ctx.Response{data=[]base}
// @Router  /bill/details/chart/line [get]
func Line(c *ctx.Context) {
	query, args, err := c.BuildQuery(&lineParam{})
	if err != nil {
		c.BadRequest(err)
		return
	}

	var flag string
	switch c.Query("date") {
	case "week":
		flag = "%W"
	case "month":
		flag = "%m"
	case "year":
		flag = "%Y"
	default:
		c.BadRequest(errorx.New("date param must be week/month/year"))
		return
	}
	selectVal := fmt.Sprintf(`SUM(money) as value, STRFTIME("%s", created_at) as key`, flag)
	groupBy := fmt.Sprintf(`STRFTIME("%s", created_at)`, flag)

	res := make([]base, 0)
	err = db.Client().Select(selectVal).Model(db.BillDetails{}).
		Where(query, args...).Group(groupBy).Limit(12).Scan(&res).Error
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{
		Msg:  "success",
		Data: res,
	})
}
