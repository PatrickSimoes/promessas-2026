import { Text, View } from 'react-native';

type Item = {
  id: string;
  name: string;
};

export function ListItem({ item }: { item: Item }) {
  return (
    <View style={{ padding: 16 }}>
      <Text>{item.name}</Text>
    </View>
  );
}
