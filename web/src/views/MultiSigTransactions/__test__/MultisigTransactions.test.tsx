import MultiSigTransactions from "../MultisigTransactions";
import { render } from '../../../test/index';
import {Provider} from "react-redux";
import {ChakraProvider} from "@chakra-ui/react";
import store from "../../../store/store";
import translations from '../../../translations/en/multiSig.json';



describe(`<${MultiSigTransactions.name} />`, () => {
    beforeEach(() => {});

    const renderWithProviders = (ui:any) => {
        return render(
            <Provider store={store}>
                <ChakraProvider>
                    {ui}
                </ChakraProvider>
            </Provider>
        );
    };

    test('should render correctly', () => {
        const component = renderWithProviders(<MultiSigTransactions />);

        expect(component.asFragment()).toMatchSnapshot();
    });

    test('should have title', () => {
        const component = renderWithProviders(<MultiSigTransactions />);
        const header = component.getByTestId('base-container-heading');

        expect(header).toHaveTextContent(translations.title);
    });
});