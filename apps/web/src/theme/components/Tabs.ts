export const Tabs = {
	variants: {
		simple: {
			tab: {
				borderBottom: '1px solid',
				borderBottomColor: 'brand.gray300',
				_selected: {
					borderBottom: '4px solid',
					borderBottomColor: 'light.purple2',
					_focus: {
						boxShadow: 'none',
					},
				},
			},
		},
	},
};
