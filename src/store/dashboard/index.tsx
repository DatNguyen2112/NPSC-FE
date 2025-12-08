import { Action, Slice, State, useAppDispatch, useTypedSelector } from "@store";
import { CommonEntity, QueryParams } from "@models";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API, routerLinks } from "@utils";
import dayjs, { Dayjs } from 'dayjs';
import { customMessage } from "src";

const name = 'DashboardVisualize';
const action = {
  ...new Action<DashboardModel, EStatusDashboardManagement>(name),
  getSalesRevenue: createAsyncThunk(name + 'getSalesRevenue', async (params: QueryParams) => {
    return await API.get(`${routerLinks(name, 'api')}/sales-revenue`, params);
  }),
  getTopRevenue: createAsyncThunk(name + 'getTopRevenue', async (params: QueryParams) => {
    return await API.get(`${routerLinks(name, 'api')}/top-five-revenue`, params);
  }),
  getReturnedOrder: createAsyncThunk(name + 'getReturnedOrder', async (params: QueryParams) => {
    return await API.get(`${routerLinks(name, 'api')}/returned-orders`, params);
  }),
  getValueReturned: createAsyncThunk(name + 'getValueReturned', async (params: QueryParams) => {
    return await API.get(`${routerLinks(name, 'api')}/value-returned-orders`, params);
  }),
  getTotalAmount: createAsyncThunk(name + 'getTotalAmount', async (params: QueryParams) => {
    return await API.get(`${routerLinks(name, 'api')}/total-amount`, params);
  }),
  getOrderStatus: createAsyncThunk(name + 'getOrderStatus', async () => {
    return await API.get(`${routerLinks(name, 'api')}/order-by-status`);
  }),
  getQuantityQuotes: createAsyncThunk(name + 'getQuantityQuotes', async () => {
    return await API.get(`${routerLinks(name, 'api')}/value-quantity-quotes`);
  }),
  getPercentageQuotes: createAsyncThunk(name + 'getPercentageQuotes', async (params: QueryParams) => {
    return await API.get(`${routerLinks(name, 'api')}/value-percentage-quotes`, params);
  }),
  getTopDebt: createAsyncThunk(name + 'getTopDebt', async (params: QueryParams) => {
    return await API.get(`${routerLinks(name, 'api')}/top-five-debt`, params);
  })

}

export const dashboardSlice = createSlice(new Slice<DashboardModel, EStatusDashboardManagement>(action, { }, (builder) => {
  builder
    //sale
    .addCase(action.getSalesRevenue.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusDashboardManagement.getSalesRevenuePending;
    })
    .addCase(action.getSalesRevenue.fulfilled, (state: StateDashboardType<DashboardModel>, action: any) => {
      state.isLoading = false;
      state.dataSalesRevenue = action.payload.data
      state.status = EStatusDashboardManagement.getSalesRevenueFulfilled;
    })
    .addCase(action.getSalesRevenue.rejected, (state) => {
      state.isLoading = false;
      state.status = EStatusDashboardManagement.getSalesRevenueRejected;
    })
    //top
    .addCase(action.getTopRevenue.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusDashboardManagement.getTopRevenuePending;
    })
    .addCase(action.getTopRevenue.fulfilled, (state: StateDashboardType<DashboardModel>, action: any) => {
      state.isLoading = false;
      state.dataTopRevenue = action.payload.data;
      state.status = EStatusDashboardManagement.getTopRevenueFulfilled;
    })
    .addCase(action.getTopRevenue.rejected, (state) => {
      state.isLoading = false;
      state.status = EStatusDashboardManagement.getTopRevenueRejected;
    })
    //return
    .addCase(action.getReturnedOrder.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusDashboardManagement.getReturnedOrderPending;
    })
    .addCase(action.getReturnedOrder.fulfilled, (state: StateDashboardType<DashboardModel>, action: any) => {
      state.isLoading = false;
      state.dataReturnedOrder = action.payload.data;
      state.status = EStatusDashboardManagement.getReturnedOrderFulfilled;
    })
    .addCase(action.getReturnedOrder.rejected, (state) => {
      state.isLoading = false;
      state.status = EStatusDashboardManagement.getReturnedOrderRejected;
    })
    //value return
    .addCase(action.getValueReturned.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusDashboardManagement.getValueReturnedPending;
    })
    .addCase(action.getValueReturned.fulfilled, (state: StateDashboardType<DashboardModel>, action: any) => {
      state.isLoading = false;
      state.dataValueReturned = action.payload.data.dataObjects;
      state.status = EStatusDashboardManagement.getValueReturnedFulfilled;
    })
    .addCase(action.getValueReturned.rejected, (state) => {
      state.isLoading = false;
      state.status = EStatusDashboardManagement.getValueReturnedRejected;
    })
    //total
    .addCase(action.getTotalAmount.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusDashboardManagement.getTotalAmountPending;
    })
    .addCase(action.getTotalAmount.fulfilled, (state: StateDashboardType<DashboardModel>, action: any) => {
      state.isLoading = false;
      state.dataTotalAmount = action.payload.data.dataObjects;
      state.status = EStatusDashboardManagement.getTotalAmountFulfilled;
    })
    .addCase(action.getTotalAmount.rejected, (state) => {
      state.isLoading = false;
      state.status = EStatusDashboardManagement.getTotalAmountRejected;
    })
    //order status
    .addCase(action.getOrderStatus.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusDashboardManagement.getOrderStatusPending;
    })
    .addCase(action.getOrderStatus.fulfilled, (state: StateDashboardType<DashboardModel>, action: any) => {
      state.isLoading = false;
      state.dataOrderStatus = action.payload.data;
      state.status = EStatusDashboardManagement.getOrderStatusFulfilled;
    })
    .addCase(action.getOrderStatus.rejected, (state) => {
      state.isLoading = false;
      state.status = EStatusDashboardManagement.getOrderStatusRejected;
    })
    //quantity quotes
    .addCase(action.getQuantityQuotes.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusDashboardManagement.getQuantityQuotesPending;
    })
    .addCase(action.getQuantityQuotes.fulfilled, (state: StateDashboardType<DashboardModel>, action: any) => {
      state.isLoading = false;
      state.dataQuantityQuotes = action.payload.data;
      state.status = EStatusDashboardManagement.getQuantityQuotesFulfilled;
    })
    .addCase(action.getQuantityQuotes.rejected, (state) => {
      state.isLoading = false;
      state.status = EStatusDashboardManagement.getQuantityQuotesRejected;
    })
    //percent quotes
    .addCase(action.getPercentageQuotes.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusDashboardManagement.getPercentageQuotesPending;
    })
    .addCase(action.getPercentageQuotes.fulfilled, (state: StateDashboardType<DashboardModel>, action: any) => {
      state.isLoading = false;
      state.dataPercentageQuotes = action.payload.data.dataObjects;
      state.status = EStatusDashboardManagement.getPercentageQuotesFulfilled;
    })
    .addCase(action.getPercentageQuotes.rejected, (state) => {
      state.isLoading = false;
      state.status = EStatusDashboardManagement.getPercentageQuotesRejected;
    })
    //debt
    .addCase(action.getTopDebt.pending, (state) => {
      state.isLoading = true;
      state.status = EStatusDashboardManagement.getTopDebtPending;
    })
    .addCase(action.getTopDebt.fulfilled, (state: StateDashboardType<DashboardModel>, action: any) => {
      state.isLoading = false;
      state.dataTopDebt = action.payload.data;
      state.status = EStatusDashboardManagement.getTopDebtFulfilled;
    })
    .addCase(action.getTopDebt.rejected, (state) => {
      state.isLoading = false;
      state.status = EStatusDashboardManagement.getTopDebtRejected;
    })
}));

export const DashboardFacade = () => {
  const dispatch = useAppDispatch();
  return {
    ...useTypedSelector((state) => state[action.name] as StateDashboardType<DashboardModel>),
    set: (values: StateDashboardType<DashboardModel>) => dispatch(action.set(values)),
    get: (params: QueryParams) => dispatch(action.get(params)),
    getSalesRevenue: (params: QueryParams) => dispatch(action.getSalesRevenue(params)),
    getTopRevenue: (params: QueryParams) => dispatch(action.getTopRevenue(params)),
    getReturnedOrder: (params: QueryParams) => dispatch(action.getReturnedOrder(params)),
    getValueReturned: (params: QueryParams) => dispatch(action.getValueReturned(params)),
    getTotalAmount: (params: QueryParams) => dispatch(action.getTotalAmount(params)),
    getOrderStatus: () => dispatch(action.getOrderStatus()),
    getQuantityQuotes: () => dispatch(action.getQuantityQuotes()),
    getPercentageQuotes: (params: QueryParams) => dispatch(action.getPercentageQuotes(params)),
    getTopDebt: (params: QueryParams) => dispatch(action.getTopDebt(params)),
  };
};

interface StateDashboardType<T> extends State<T, EStatusDashboardManagement> {
  dataSalesRevenue?: any
  dataTopRevenue?: any
  dataReturnedOrder?: any
  dataValueReturned?: any
  dataTotalAmount?: any
  dataOrderStatus?: any
  dataQuantityQuotes?: any
  dataPercentageQuotes?: any
  dataTopDebt?: any
  //date range
  dateRange?: string[]
  dateRangeTop5?: string[]
  dateRangeTopDebt?: string[]
  dateRangeReturned?: string[]
  dateRangeCombine?: string[]
  
  dateSelectShow?: boolean
  selectedKey?: string | null
  selectedRevenueType?: string | null
  showSelectDateRevenue?: boolean
  ringChartFirstPart?: any
  ringChartLastPart?: any
 }

export class DashboardModel extends CommonEntity {
  constructor(
    public metaObjects?: any,
    public dataObjects?: any,
  ) {
    super();
  }
}

export enum EStatusDashboardManagement {
  idle = 'idle',
  getSalesRevenuePending = 'getSalesRevenuePending',
  getSalesRevenueFulfilled = 'getSalesRevenueFulfilled',
  getSalesRevenueRejected = 'getSalesRevenueRejected',
  getTopRevenuePending = 'getTopRevenuePending',
  getTopRevenueFulfilled = 'getTopRevenueFulfilled',
  getTopRevenueRejected = 'getTopRevenueRejected',
  getReturnedOrderPending = 'getReturnOrderPending',
  getReturnedOrderFulfilled = 'getReturnOrderFulfilled',
  getReturnedOrderRejected = 'getReturnOrderRejected',
  getValueReturnedPending = 'getValueReturnedPending',
  getValueReturnedFulfilled = 'getValueReturnedFulfilled',
  getValueReturnedRejected = 'getValueReturnedRejected',
  getTotalAmountPending = 'getTotalAmountPending',
  getTotalAmountFulfilled = 'getTotalAmountFulfilled',
  getTotalAmountRejected = 'getTotalAmountRejected',
  getOrderStatusPending = 'getOrderStatusPending',
  getOrderStatusFulfilled = 'getOrderStatusFulfilled',
  getOrderStatusRejected = 'getOrderStatusRejected',
  getQuantityQuotesPending = 'getQuantityQuotesPending',
  getQuantityQuotesFulfilled = 'getQuantityQuotesFulfilled',
  getQuantityQuotesRejected = 'getQuantityQuotesRejected',
  getPercentageQuotesPending = 'getPercentageQuotesPending',
  getPercentageQuotesFulfilled = 'getPercentageQuotesFulfilled',
  getPercentageQuotesRejected = 'getPercentageQuotesRejected',
  getTopDebtPending = 'getTopDebtPending',
  getTopDebtFulfilled = 'getTopDebtFulfilled',
  getTopDebtRejected = 'getTopDebtRejected',
}