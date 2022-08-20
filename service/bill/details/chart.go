package details

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/beyond/utils"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
	"github.com/yahuian/gox/slicex"
)

type pieParam struct {
	Kind      string   `form:"kind" json:"kind" validate:"oneof=income pay"`
	CreatedAt []string `form:"created_at[]" json:"created_at" validate:"omitempty,len=2,dive,datetime=2006-01-02 15:04:05"`
	Type      []string `form:"type[]" json:"type"`
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
// @Param   field        query    string false "which field to aggregate" Enums(ledger, type)
// @Param   kind         query    string false "kind"                     Enums(income, pay)
// @Param   created_at[] query    string false "created_at"
// @Param   ledger[]     query    string false "ledger"
// @Success 200          {object} ctx.Response{data=[]base}
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
	if field == "ledger" {
		selectVal = "SUM(money) as value, ledger as key"
	} else if field == "type" {
		selectVal = "SUM(money) as value, type as key"
	} else {
		c.BadRequest(errorx.New("field param must be ledger/type"))
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

	slicex.Map(res, func(i int, v base) base {
		res[i].Value = utils.Cent(v.Value)
		if v.Key == "" {
			res[i].Key = "未知"
		}
		return v
	})

	c.SuccessWith(ctx.Response{
		Msg:  "success",
		Data: res,
	})
}

type lineParam struct {
	Kind   string   `form:"kind" json:"kind" validate:"oneof=income pay"`
	Type   []string `form:"type[]" json:"type"`
	Ledger []string `form:"ledger[]" json:"ledger"`
}

type lineResp struct {
	Bases  []base  `json:"bases"`
	Budget float64 `json:"budget"`
}

// @Summary 折线图
// @Tags    bill
// @Accept  json
// @Produce json
// @Param   date     query    string true  "date" Enums(day,week,month,year)
// @Param   kind     query    string false "kind" Enums(income, pay)
// @Param   type[]   query    string false "type"
// @Param   ledger[] query    string false "ledger"
// @Success 200      {object} ctx.Response{data=lineResp}
// @Router  /bill/details/chart/line [get]
func Line(c *ctx.Context) {
	var param lineParam
	query, args, err := c.BuildQuery(&param)
	if err != nil {
		c.BadRequest(err)
		return
	}

	var (
		flag  string
		limit = 12
	)
	switch c.Query("date") {
	case "day":
		flag, limit = "%m-%d", 31
	case "week":
		flag = "%Y-%W"
	case "month":
		flag = "%m"
	case "year":
		flag = "%Y"
	default:
		c.BadRequest(errorx.New("date param must be day/week/month/year"))
		return
	}
	selectVal := fmt.Sprintf(`SUM(money) as value, STRFTIME("%s", created_at) as key`, flag)
	groupBy := fmt.Sprintf(`STRFTIME("%s", created_at)`, flag)

	res := make([]base, 0)
	err = db.Client().Select(selectVal).Model(db.BillDetails{}).
		Where(query, args...).Group(groupBy).Limit(limit).Scan(&res).Error
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	slicex.Map(res, func(i int, v base) base {
		res[i].Value = utils.Cent(v.Value)

		// 显示每周的最后一天(周一为每周的开始)
		if c.Query("date") == "week" {
			list := strings.Split(v.Key, "-")
			year, _ := strconv.Atoi(list[0])
			week, _ := strconv.Atoi(list[1])
			res[i].Key = weekEnd(year, week)
		}
		return v
	})

	result := lineResp{
		Bases: res,
	}

	// 获取每月预算
	if c.Query("date") == "month" {
		ledgers, err := db.GetAll[db.BillLedger]("name IN ?", param.Ledger)
		if err != nil {
			logx.Errorf("%+v", err)
			c.InternalErr(err)
			return
		}
		for _, v := range ledgers {
			result.Budget += v.Budget
		}
	}

	c.SuccessWith(ctx.Response{
		Msg:  "success",
		Data: result,
	})
}

// https://stackoverflow.com/a/52303730
func weekEnd(year, week int) string {
	// Start from the middle of the year:
	t := time.Date(year, 7, 1, 0, 0, 0, 0, time.UTC)

	// Roll back to Monday:
	if wd := t.Weekday(); wd == time.Sunday {
		t = t.AddDate(0, 0, -6)
	} else {
		t = t.AddDate(0, 0, -int(wd)+1)
	}

	// Difference in weeks:
	_, w := t.ISOWeek()
	t = t.AddDate(0, 0, (week-w)*7)

	t = t.AddDate(0, 0, 6)

	return t.Format("01-02")
}
