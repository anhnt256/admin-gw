/* eslint-disable import/first,consistent-return */
/* eslint-disable consistent-return */

export const EnumProductGroup = {
	WALLET: {
		id: 0,
		description: 'Nạp tiền',
	},
	FOOD: {
		id: 1,
		description: 'Thức ăn',
	},
	DRINK: {
		id: 2,
		description: 'Nước uống',
	},
	HOURS: {
		id: 3,
		description: 'Nạp giờ',
	},
	CARD: {
		id: 4,
		description: 'Thẻ',
	},
	TOPPING: {
		id: 5,
		description: 'Món thêm',
	},
	COMBO: {
		id: 6,
		description: 'Combo',
	},
};

export const EnumOrderStatus = {
	CANCEL: {
		id: 1,
		description: 'Đơn hàng bị hủy',
	},
	RECEIVED: {
		id: 2,
		description: 'Đơn hàng mới order',
	},
	PROCESSING: {
		id: 3,
		description: 'Đơn hàng được chấp nhận',
	},
	FINISHED: {
		id: 4,
		description: 'Đơn hàng đã thanh toán',
	},
};

export const EnumResponseStatus = {
	SERVER_ERROR: {
		id: -1,
		description: 'Lỗi hệ thống. Vui lòng liên hệ quản trị viên.',
	},
	SUCCESS: {
		id: 0,
		description: 'Thành công',
	},
	REQUIRE_LOGIN: {
		id: 1,
		description: 'Yêu cầu đăng nhập.',
	},
	PARAM_INVALID: {
		id: 2,
		description: 'Đơn hàng đã thanh toán',
	},
	EXITS_USERNAME: {
		id: 3,
		description: 'Tên đăng nhập đã tồn tại',
	},
	EXITS_EMAIL: {
		id: 4,
		description: 'Email đã tồn tại.',
	},
	ACCOUNT_INACTIVE: {
		id: 5,
		description: 'Tài khoản bị khóa.',
	},
	REQUIRE_USERNAME: {
		id: 6,
		description: 'Yêu cầu tên đăng nhập',
	},
};

export const EnumPromotionType = {
	PERCENT: {
		id: 1,
		description: 'Phần trăm',
	},
	VALUE: {
		id: 2,
		description: 'Giá bán',
	},
};

export const EnumComputerStatus = {
	OFF: {
		id: 2,
		description: 'Máy tắt',
	},
	READY: {
		id: 1,
		description: 'Sẵn sàng',
	},
	ON: {
		id: 3,
		description: 'Đang hoạt động',
	}
}

