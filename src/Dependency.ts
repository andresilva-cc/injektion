import { Container } from '.';
import DependencyType from './DependencyType';

export type Instructions = (container: typeof Container) => any;

interface Dependency {
  type: DependencyType;
  reference: typeof Function;
  instructions?: Instructions;
  instance?: any;
  resolved: boolean;
}

export default Dependency;
