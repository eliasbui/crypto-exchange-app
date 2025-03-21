import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Animated } from 'react-native';
import { useUIStore } from '../store/uiStore';
import { getTheme, spacing, radius } from '../constants/theme';
import Text from './ui/Text';
import Button from './ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

type OrderType = 'market' | 'limit' | 'stop-limit';

interface TradeFormProps {
  type: 'buy' | 'sell';
  maxAmount: number;
  currentPrice: number;
  onSubmit: (order: {
    type: OrderType;
    price: number;
    stopPrice?: number;
    amount: number;
  }) => void;
}

const TradeForm: React.FC<TradeFormProps> = ({
  type,
  maxAmount,
  currentPrice,
  onSubmit,
}) => {
  const themeType = useUIStore((state) => state.theme);
  const theme = getTheme(themeType);

  const [orderType, setOrderType] = useState<OrderType>('market');
  const [price, setPrice] = useState(currentPrice.toString());
  const [stopPrice, setStopPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [error, setError] = useState('');

  // Update price when current price changes
  useEffect(() => {
    if (orderType === 'market') {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice, orderType]);

  const handlePercentageSelect = (value: number) => {
    setPercentage(value);
    const calculatedAmount = (maxAmount * value) / 100;
    setAmount(calculatedAmount.toFixed(6));
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (orderType !== 'market' && (!price || parseFloat(price) <= 0)) {
      setError('Please enter a valid price');
      return;
    }

    if (orderType === 'stop-limit' && (!stopPrice || parseFloat(stopPrice) <= 0)) {
      setError('Please enter a valid stop price');
      return;
    }

    const order = {
      type: orderType,
      price: orderType === 'market' ? currentPrice : parseFloat(price),
      ...(orderType === 'stop-limit' && { stopPrice: parseFloat(stopPrice) }),
      amount: parseFloat(amount),
    };

    onSubmit(order);
  };

  const renderOrderTypeSelector = () => (
    <View style={styles.orderTypeSelector}>
      <TouchableOpacity
        style={[
          styles.orderTypeButton,
          orderType === 'market' && [styles.activeOrderType, { backgroundColor: theme.primary + '20' }],
        ]}
        onPress={() => setOrderType('market')}
      >
        <Text
          variant="body2"
          weight="semibold"
          color={orderType === 'market' ? 'primary' : 'secondaryText'}
        >
          Market
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.orderTypeButton,
          orderType === 'limit' && [styles.activeOrderType, { backgroundColor: theme.primary + '20' }],
        ]}
        onPress={() => setOrderType('limit')}
      >
        <Text
          variant="body2"
          weight="semibold"
          color={orderType === 'limit' ? 'primary' : 'secondaryText'}
        >
          Limit
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.orderTypeButton,
          orderType === 'stop-limit' && [styles.activeOrderType, { backgroundColor: theme.primary + '20' }],
        ]}
        onPress={() => setOrderType('stop-limit')}
      >
        <Text
          variant="body2"
          weight="semibold"
          color={orderType === 'stop-limit' ? 'primary' : 'secondaryText'}
        >
          Stop Limit
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPercentageSelector = () => (
    <View style={styles.percentageSelector}>
      {[25, 50, 75, 100].map((value) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.percentageButton,
            percentage === value && [styles.activePercentage, { backgroundColor: theme.primary + '20' }],
          ]}
          onPress={() => handlePercentageSelect(value)}
        >
          <Text
            variant="body2"
            weight="semibold"
            color={percentage === value ? 'primary' : 'secondaryText'}
          >
            {value}%
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Animatable.View
      animation="fadeIn"
      duration={300}
      style={[styles.container, { backgroundColor: theme.card }]}
    >
      {renderOrderTypeSelector()}

      {orderType !== 'market' && (
        <View style={styles.inputGroup}>
          <Text variant="body2" color="secondaryText">Price</Text>
          <View style={[styles.inputContainer, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                setError('');
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.secondaryText}
            />
            <Text variant="body2" color="secondaryText">USD</Text>
          </View>
        </View>
      )}

      {orderType === 'stop-limit' && (
        <View style={styles.inputGroup}>
          <Text variant="body2" color="secondaryText">Stop Price</Text>
          <View style={[styles.inputContainer, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={stopPrice}
              onChangeText={(text) => {
                setStopPrice(text);
                setError('');
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.secondaryText}
            />
            <Text variant="body2" color="secondaryText">USD</Text>
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text variant="body2" color="secondaryText">Amount</Text>
        <View style={[styles.inputContainer, { borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setPercentage(0);
              setError('');
            }}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.secondaryText}
          />
          <Text variant="body2" color="secondaryText">BTC</Text>
        </View>
      </View>

      {renderPercentageSelector()}

      {error ? (
        <Animatable.View
          animation="shake"
          style={[styles.errorContainer, { backgroundColor: theme.danger + '20' }]}
        >
          <Text color="danger" style={styles.errorText}>{error}</Text>
        </Animatable.View>
      ) : null}

      <Button
        title={`${type === 'buy' ? 'Buy' : 'Sell'} ${orderType === 'market' ? 'at Market Price' : 'at Limit Price'}`}
        variant={type === 'buy' ? 'success' : 'error'}
        onPress={handleSubmit}
        style={styles.submitButton}
      />
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
  orderTypeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  activeOrderType: {
    borderRadius: radius.sm,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  percentageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  percentageButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  activePercentage: {
    borderRadius: radius.sm,
  },
  errorContainer: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});

export default TradeForm; 